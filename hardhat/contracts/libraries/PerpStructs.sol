// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PerpStructs {
    struct Position {
        address trader;
        address token;
        bool isLong;
        uint256 size;
        uint256 margin;
        uint256 entryPrice;
        uint256 liquidationPrice;
        uint256 leverage;
        uint256 lastUpdateTimestamp;
    }

    struct Market {
        bool isActive;
        uint256 maxLeverage;
        uint256 liquidationThreshold;
        uint256 maintenanceMargin;
        uint256 minPositionSize;
        uint256 maxPositionSize;
        uint256 totalLongPositions;
        uint256 totalShortPositions;
        uint256 openInterest;
        uint256 fundingRate;
        uint256 lastFundingUpdate;
    }

    struct MarketInfo {
        uint256 price;
        uint256 longPositions;
        uint256 shortPositions;
        uint256 fundingRate;
    }

    enum PositionAction {
        OPEN,
        CLOSE,
        INCREASE,
        DECREASE,
        LIQUIDATE
    }

    event PositionModified(
        address indexed trader,
        address indexed token,
        PositionAction action,
        bool isLong,
        uint256 size,
        uint256 margin,
        uint256 price
    );

    event PositionLiquidated(
        address indexed trader,
        address indexed token,
        bool isLong,
        uint256 size,
        uint256 margin,
        uint256 price,
        address liquidator
    );

    event MarketUpdated(
        address indexed token,
        uint256 price,
        uint256 fundingRate,
        uint256 openInterest
    );
} 