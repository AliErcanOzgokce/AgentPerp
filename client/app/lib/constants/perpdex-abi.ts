export const PERPDEX_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_oracle",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_collateralToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxLeverage",
        "type": "uint256"
      }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "margin",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "entryPrice",
        "type": "uint256"
      }
    ],
    "name": "PositionClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "trader",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "margin",
        "type": "uint256"
      }
    ],
    "name": "PositionLiquidated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "margin",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "entryPrice",
        "type": "uint256"
      }
    ],
    "name": "PositionOpened",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BASE_FUNDING_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LIQUIDATION_THRESHOLD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAINTENANCE_MARGIN_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_LEVERAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "closePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collateralToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "maxLeverage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidationThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minPositionSize",
        "type": "uint256"
      }
    ],
    "name": "createMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "maxLeverage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidationThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minPositionSize",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPositionSize",
            "type": "uint256"
          },
          {
            "internalType": "int256",
            "name": "fundingRate",
            "type": "int256"
          },
          {
            "internalType": "uint256",
            "name": "totalLongPositions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalShortPositions",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "openInterest",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastFundingUpdate",
            "type": "uint256"
          }
        ],
        "internalType": "struct Market.MarketStruct",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "trader",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getPosition",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "trader",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isLong",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "size",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "margin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "entryPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidationPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "leverage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdateTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct Position.PositionStruct",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "trader",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getUnrealizedPnL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "trader",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "liquidatePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "markets",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "margin",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "leverage",
        "type": "uint256"
      }
    ],
    "name": "openPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 