// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";

library PerpMath {
    using Math for uint256;

    uint256 public constant PRECISION = 1e6;
    uint256 public constant FUNDING_PRECISION = 1e10;
    uint256 public constant LIQUIDATION_PRECISION = 1e4;

    function calculatePositionValue(
        uint256 size,
        uint256 entryPrice,
        uint256 currentPrice,
        bool isLong
    ) internal pure returns (uint256) {
        if (isLong) {
            return size * currentPrice / entryPrice;
        } else {
            return size * (2 * entryPrice - currentPrice) / entryPrice;
        }
    }

    function calculateUnrealizedPnL(
        uint256 size,
        uint256 entryPrice,
        uint256 currentPrice,
        bool isLong
    ) internal pure returns (int256) {
        uint256 positionValue = calculatePositionValue(size, entryPrice, currentPrice, isLong);
        return int256(positionValue) - int256(size);
    }

    function calculateLiquidationPrice(
        uint256 size,
        uint256 margin,
        uint256 liquidationThreshold,
        bool isLong
    ) internal pure returns (uint256) {
        uint256 threshold = margin * liquidationThreshold / LIQUIDATION_PRECISION;
        if (isLong) {
            return (size - threshold) * PRECISION / size;
        } else {
            return (size + threshold) * PRECISION / size;
        }
    }

    function calculateFundingRate(
        uint256 longPositions,
        uint256 shortPositions,
        uint256 baseRate
    ) internal pure returns (int256) {
        if (longPositions == 0 || shortPositions == 0) return 0;
        
        uint256 ratio;
        bool isPositive;
        
        if (longPositions > shortPositions) {
            ratio = (longPositions * FUNDING_PRECISION) / shortPositions;
            isPositive = true;
        } else {
            ratio = (shortPositions * FUNDING_PRECISION) / longPositions;
            isPositive = false;
        }
        
        uint256 fundingRate = (ratio - FUNDING_PRECISION) * baseRate / FUNDING_PRECISION;
        return isPositive ? int256(fundingRate) : -int256(fundingRate);
    }

    function calculateMaintenanceMargin(
        uint256 positionSize,
        uint256 leverage,
        uint256 maintenanceMarginRate
    ) internal pure returns (uint256) {
        return (positionSize * maintenanceMarginRate) / (leverage * PRECISION);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
} 