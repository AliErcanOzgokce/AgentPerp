// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract PriceOracle is Ownable {
    using Math for uint256;

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 decimals;
    }

    mapping(address => PriceData) public prices;
    mapping(address => bool) public supportedTokens;
    
    uint256 public constant PRICE_PRECISION = 1e8;
    uint256 public constant MAX_PRICE_AGE = 30 minutes;

    event PriceUpdated(address token, uint256 price, uint256 timestamp);
    event TokenSupported(address token, uint256 initialPrice, uint256 decimals);

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token, uint256 initialPrice, uint256 decimals) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        require(initialPrice > 0, "Invalid initial price");
        
        supportedTokens[token] = true;
        prices[token] = PriceData({
            price: initialPrice,
            timestamp: block.timestamp,
            decimals: decimals
        });
        
        emit TokenSupported(token, initialPrice, decimals);
        emit PriceUpdated(token, initialPrice, block.timestamp);
    }

    function updatePrice(address token, uint256 newPrice) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(newPrice > 0, "Invalid price");
        
        prices[token].price = newPrice;
        prices[token].timestamp = block.timestamp;
        
        emit PriceUpdated(token, newPrice, block.timestamp);
    }

    function getPrice(address token) external view returns (uint256) {
        require(supportedTokens[token], "Token not supported");
        require(block.timestamp - prices[token].timestamp <= MAX_PRICE_AGE, "Price too old");
        return prices[token].price;
    }

    function getLatestPriceData(address token) external view returns (PriceData memory) {
        require(supportedTokens[token], "Token not supported");
        require(block.timestamp - prices[token].timestamp <= MAX_PRICE_AGE, "Price too old");
        return prices[token];
    }

    function batchUpdatePrices(
        address[] calldata tokens,
        uint256[] calldata newPrices
    ) external onlyOwner {
        require(tokens.length == newPrices.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            require(supportedTokens[tokens[i]], "Token not supported");
            require(newPrices[i] > 0, "Invalid price");
            
            prices[tokens[i]].price = newPrices[i];
            prices[tokens[i]].timestamp = block.timestamp;
            
            emit PriceUpdated(tokens[i], newPrices[i], block.timestamp);
        }
    }
} 