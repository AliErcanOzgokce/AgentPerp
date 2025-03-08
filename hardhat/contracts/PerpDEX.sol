// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/PerpMath.sol";
import "./libraries/PerpStructs.sol";
import "./oracle/PriceOracle.sol";

contract PerpDEX is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using PerpMath for uint256;

    // State variables
    PriceOracle public oracle;
    IERC20 public collateralToken; // USDC
    
    mapping(address => mapping(address => PerpStructs.Position)) public positions; // trader => token => Position
    mapping(address => PerpStructs.Market) public markets; // token => Market
    mapping(address => bool) public supportedTokens;
    
    // Constants
    uint256 public constant MAX_LEVERAGE = 100; // 100x
    uint256 public constant BASE_FUNDING_RATE = 1e6; // 0.0001% per hour
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant MAINTENANCE_MARGIN_RATE = 5e4; // 5%
    uint256 public constant MINIMUM_MARGIN = 10e6; // 10 USDC

    // Events
    event MarketCreated(address token, uint256 maxLeverage);
    event PositionOpened(
        address indexed trader,
        address indexed token,
        bool isLong,
        uint256 size,
        uint256 margin,
        uint256 leverage
    );
    event PositionClosed(
        address indexed trader,
        address indexed token,
        bool isLong,
        uint256 size,
        uint256 margin,
        int256 pnl
    );
    event PositionLiquidated(
        address indexed trader,
        address indexed token,
        address liquidator,
        uint256 size,
        uint256 margin
    );

    constructor(address _oracle, address _collateralToken) Ownable(msg.sender) {
        require(_oracle != address(0), "Invalid oracle address");
        require(_collateralToken != address(0), "Invalid collateral token");
        oracle = PriceOracle(_oracle);
        collateralToken = IERC20(_collateralToken);
    }

    // Market Management Functions
    function createMarket(
        address token,
        uint256 maxLeverage,
        uint256 liquidationThreshold,
        uint256 maintenanceMargin
    ) external onlyOwner {
        require(!markets[token].isActive, "Market already exists");
        require(maxLeverage <= MAX_LEVERAGE, "Leverage too high");
        
        markets[token] = PerpStructs.Market({
            isActive: true,
            maxLeverage: maxLeverage,
            liquidationThreshold: liquidationThreshold,
            maintenanceMargin: maintenanceMargin,
            minPositionSize: 0,
            maxPositionSize: type(uint256).max,
            totalLongPositions: 0,
            totalShortPositions: 0,
            openInterest: 0,
            fundingRate: 0,
            lastFundingUpdate: block.timestamp
        });
        
        supportedTokens[token] = true;
        emit MarketCreated(token, maxLeverage);
    }

    // Trading Functions
    function openPosition(
        address token,
        bool isLong,
        uint256 margin,
        uint256 leverage
    ) external nonReentrant {
        require(markets[token].isActive, "Market not active");
        require(leverage > 0 && leverage <= markets[token].maxLeverage, "Invalid leverage");
        require(margin >= MINIMUM_MARGIN, "Margin too low");
        
        uint256 price = oracle.getPrice(token);
        require(price > 0, "Invalid price");
        
        uint256 size = margin * leverage;
        
        // Transfer margin from trader
        collateralToken.safeTransferFrom(msg.sender, address(this), margin);
        
        // Create position
        positions[msg.sender][token] = PerpStructs.Position({
            trader: msg.sender,
            token: token,
            isLong: isLong,
            size: size,
            margin: margin,
            entryPrice: price,
            liquidationPrice: PerpMath.calculateLiquidationPrice(
                size,
                margin,
                markets[token].liquidationThreshold,
                isLong
            ),
            leverage: leverage,
            lastUpdateTimestamp: block.timestamp
        });
        
        // Update market state
        if (isLong) {
            markets[token].totalLongPositions += size;
        } else {
            markets[token].totalShortPositions += size;
        }
        markets[token].openInterest += size;
        
        emit PositionOpened(msg.sender, token, isLong, size, margin, leverage);
    }

    function closePosition(address token) external nonReentrant {
        PerpStructs.Position storage position = positions[msg.sender][token];
        require(position.size > 0, "No position");
        
        uint256 price = oracle.getPrice(token);
        require(price > 0, "Invalid price");
        
        int256 pnl = PerpMath.calculateUnrealizedPnL(
            position.size,
            position.entryPrice,
            price,
            position.isLong
        );
        
        uint256 marginToReturn = position.margin;
        if (pnl > 0) {
            marginToReturn += uint256(pnl);
        } else {
            marginToReturn = marginToReturn > uint256(-pnl) ? marginToReturn - uint256(-pnl) : 0;
        }
        
        // Update market state
        if (position.isLong) {
            markets[token].totalLongPositions -= position.size;
        } else {
            markets[token].totalShortPositions -= position.size;
        }
        markets[token].openInterest -= position.size;
        
        // Clear position
        delete positions[msg.sender][token];
        
        // Transfer remaining margin back to trader
        if (marginToReturn > 0) {
            collateralToken.safeTransfer(msg.sender, marginToReturn);
        }
        
        emit PositionClosed(msg.sender, token, position.isLong, position.size, position.margin, pnl);
    }

    function liquidatePosition(address trader, address token) external nonReentrant {
        PerpStructs.Position storage position = positions[trader][token];
        require(position.size > 0, "No position");
        
        uint256 price = oracle.getPrice(token);
        require(price > 0, "Invalid price");
        
        require(canLiquidate(position, price), "Cannot liquidate");
        
        // Calculate liquidation fee (1% of position size)
        uint256 liquidationFee = position.size / 100;
        
        // Update market state
        if (position.isLong) {
            markets[token].totalLongPositions -= position.size;
        } else {
            markets[token].totalShortPositions -= position.size;
        }
        markets[token].openInterest -= position.size;
        
        // Transfer liquidation fee to liquidator
        collateralToken.safeTransfer(msg.sender, liquidationFee);
        
        // Clear position
        delete positions[trader][token];
        
        emit PositionLiquidated(trader, token, msg.sender, position.size, position.margin);
    }

    // View Functions
    function getPosition(address trader, address token) external view returns (PerpStructs.Position memory) {
        return positions[trader][token];
    }

    function getMarket(address token) external view returns (PerpStructs.Market memory) {
        return markets[token];
    }

    function getUnrealizedPnL(address trader, address token) external view returns (int256) {
        PerpStructs.Position storage position = positions[trader][token];
        if (position.size == 0) return 0;
        
        uint256 price = oracle.getPrice(token);
        require(price > 0, "Invalid price");
        
        return PerpMath.calculateUnrealizedPnL(
            position.size,
            position.entryPrice,
            price,
            position.isLong
        );
    }

    // Internal Functions
    function canLiquidate(PerpStructs.Position storage position, uint256 currentPrice) internal view returns (bool) {
        int256 pnl = PerpMath.calculateUnrealizedPnL(
            position.size,
            position.entryPrice,
            currentPrice,
            position.isLong
        );
        
        if (pnl >= 0) return false;
        
        uint256 remainingMargin = position.margin > uint256(-pnl) ? position.margin - uint256(-pnl) : 0;
        uint256 maintenanceMargin = PerpMath.calculateMaintenanceMargin(
            position.size,
            position.leverage,
            markets[position.token].maintenanceMargin
        );
        
        return remainingMargin < maintenanceMargin;
    }
} 