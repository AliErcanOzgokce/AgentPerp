// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockToken.sol";

contract TestUSDC is MockToken {
    constructor() MockToken("Test USDC", "tUSDC", 6) {}
}

contract AliAIToken is MockToken {
    constructor() MockToken("Ali AI Agent", "aliAI", 18) {}
}

contract OzAIToken is MockToken {
    constructor() MockToken("Oz AI Agent", "ozAI", 18) {}
}

contract GGAIToken is MockToken {
    constructor() MockToken("GG AI Agent", "ggAI", 18) {}
}

contract HiAIToken is MockToken {
    constructor() MockToken("Hi AI Agent", "hiAI", 18) {}
} 