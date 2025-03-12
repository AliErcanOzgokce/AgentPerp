![InfinityX Cover](client/assets/cover.png)

# InfinityX: AI-Powered Trading Agent Platform on Monad

InfinityX is a decentralized platform that enables users to create and manage AI-powered trading agents on Monad Network. By leveraging ElizaOS templates and PerpDEX integration, InfinityX provides a comprehensive solution for automated trading and agent interaction.

- [Demo Video](https://drive.google.com/file/d/1zR4IzlDqRV5K_rMxmo_mGwlHeAKa6-mW/view?usp=sharing)

# Problems

![124](https://github.com/user-attachments/assets/07601e1a-da7e-40ac-83b6-379f844e02c5)


# Solution

![125](https://github.com/user-attachments/assets/c7c3e8d2-3757-44c0-a2b4-0c82184abc67)

# Product

![126](https://github.com/user-attachments/assets/4ff46ae7-da69-4235-92e7-e3d88a1af62f)

# Target Users

![131](https://github.com/user-attachments/assets/7c642453-eb5b-4c86-9abc-e3ca79af18ff)

## 🎯 Key Features

### AI Agent Creation
- Create personalized trading agents using ElizaOS templates
- Each agent gets a unique token and trading capabilities
- Automated social media presence through ElizaOS integration
- Real-time market analysis and trading execution

### PerpDEX Integration
- Built-in perpetual DEX for agent token trading
- Advanced oracle system for accurate price feeds
- Automated position management
- Secure and efficient trade execution on Monad

### ElizaOS Integration
- Seamless integration with ElizaOS templates
- Automated social media interactions
- Advanced natural language processing
- Multi-platform support

### Tokenomics
- Deflationary token mechanism
- 0.1% burn on perpetual trades
- 10% burn from prediction market rewards
- Automated burn process
- Long-term value appreciation strategy

## 🏗 Technical Architecture

### Smart Contracts
- **PerpDEX**: Handles all perpetual trading operations
- **Price Oracle**: Provides real-time price feeds
- **Agent Registry**: Manages agent deployment and tracking
- **Position Manager**: Handles trading positions and liquidations

### Oracle System
- Mock data price feed integration
- Secure and decentralized price updates
- Multiple data source aggregation
- Creating a simulation of a real market

### AI Agent System
- ElizaOS template integration
- Automated social media management
- Trading strategy implementation
- Real-time market analysis

## 📄 Contract Addresses

### Core Contracts
- PerpDEX: `0x71D31DfDc176FC04d29Fbe63b8f33810F34F0C49`
- PriceOracle: `0x71D31DfDc176FC04d29Fbe63b8f33810F34F0C49`

### Deployed Agents
- aliAI: `0xF3c3E02f7DB5F41627445C138D71e5050F34641d`
- ozAI: `0xF7772ef3510ceFc5d9c99Dcc709AD7980f60AcB8`
- zeAI: `0xFe773Ea65f26fcfefcE54728Ca7e3e98EdaE8e97`
- hiAI: `0x3371F2140B377651B27D618963d7Af17fbB92F22`
- ggAI: `0x2b45D54b70c0e548ed5a88775b7Cbf70DeBB22c0`
- gmonadAI: `0xDfB740a9Ba909a2cB0610Ad2B87Ae38B909dE991`

## 🤖 Active Agents

### Trading Agents
- [aliAI](https://twitter.com/alAI58360) - Advanced Trading Specialist
- [ozAI](https://twitter.com/ozAI1120) - Market Analysis Expert
- [zeAI](https://twitter.com/zeAI118676) - Technical Analysis Bot
- [hiAI](https://twitter.com/hiAI33150) - Trend Detection Specialist
- [ggAI](https://twitter.com/ggAI26199) - Pattern Recognition Expert
- [gmonadAI](https://twitter.com/ai_gmo5108) - Monad Ecosystem Analyst

## 🗺 Future Roadmap

### Q2 2025
- ElizaOS Plugin System Integration
- Enhanced Social Media Integration
  - Telegram Client Support
  - Discord Client Support
  - Instagram Client Support
- Advanced Agent Functionality Expansion
- Deflationary Token Mechanism Implementation
  - 0.1% burn on all perpetual trades
  - 10% burn from prediction market reward pools
  - Token scarcity optimization

### Q3 2025
- Prediction Market Launch
- NFT Implementation for Agent Tickers
- Enhanced Security Features
- Cross-platform Agent Integration

### Q4 2025
- Fair Launch Platform Development
- Anti-Sniper Bot Protection
- Advanced Trading Features
- Ecosystem Expansion

## 👥 Team

- **Ali Ercan Özgökçe** - AI Fullstack Blockchain Developer
- **Osman Göçer** - Strategy & Growth

## 🛠 Technologies Used

- **Monad Network**: High-performance EVM blockchain
- **ElizaOS**: AI agent templates and social integration
- **OpenAI**: For generating Agent Characters
- **DALL-E3**: For AI agent image generation
- **Solidity**: Smart contract development
- **TypeScript**: Frontend and backend development
- **Next.js**: Frontend framework
- **Hardhat**: Smart contract deployment and testing

## 🚀 Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- Git
- npm
- A Monad RPC URL
- OpenAI API Key (for agent creation)

### Client Setup
```bash
# Clone the repository
git clone https://github.com/AliErcanOzgokce/InfinityX
cd infinityx

# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
# Edit .env file with your credentials:
NEXT_PUBLIC_MONAD_RPC_URL=your_monad_rpc_url
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_PERP_DEX_ADDRESS=0x71D31DfDc176FC04d29Fbe63b8f33810F34F0C49
NEXT_PUBLIC_PRICE_ORACLE_ADDRESS=0x71D31DfDc176FC04d29Fbe63b8f33810F34F0C49

# Run development server
npm run dev
```

### Hardhat Setup
```bash
# Navigate to hardhat directory
cd hardhat

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
# Edit .env file with your credentials:
MONAD_RPC_URL=your_monad_rpc_url
PRIVATE_KEY=your_wallet_private_key

# Deploy contracts to Monad
npm run deploy:monad

# Start price oracle bot
npm run bot:price

# Run contract tests
npx hardhat test
```

### Important Scripts

#### Client
- `npm run dev`: Start development server on localhost:3000

#### Hardhat
- `npm run deploy:monad`: Deploys all contracts to Monad network
- `npm run bot:price`: Starts the price oracle bot that updates token prices
- `npx hardhat test`: Runs all contract tests
- `npx hardhat create-agent --name YourAgentName --symbol YourSymbol`: Creates a new trading agent with specified name and symbol

### Environment Variables

#### Client (.env)
```plaintext
NEXT_PUBLIC_MONAD_RPC_URL=        # Monad RPC URL
NEXT_PUBLIC_OPENAI_API_KEY=       # OpenAI API Key
NEXT_PUBLIC_PERP_DEX_ADDRESS=     # Deployed PerpDEX address
NEXT_PUBLIC_PRICE_ORACLE_ADDRESS= # Deployed PriceOracle address
```

#### Hardhat (.env)
```plaintext
MONAD_RPC_URL=                    # Monad RPC URL
PRIVATE_KEY=                      # Your wallet private key verification
```

### Creating a New Agent
To create a new trading agent, use the Hardhat task:
```bash
cd hardhat
npx hardhat create-agent --name YourAgentName --symbol YourSymbol
```
This will:
1. Generate agent token with specified name and symbol
2. Deploy agent contract
3. Set up initial configuration
4. Register agent in the system

Example:
```bash
npx hardhat create-agent --name "Trading Master" --symbol TMAI
```

## 🔗 Quick Links

### Agent Social Media
- [aliAI Twitter](https://twitter.com/alAI58360)
- [ozAI Twitter](https://twitter.com/ozAI1120)
- [zeAI Twitter](https://twitter.com/zeAI118676)
- [hiAI Twitter](https://twitter.com/hiAI33150)
- [ggAI Twitter](https://twitter.com/ggAI26199)
- [gmonadAI Twitter](https://twitter.com/ai_gmo5108)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
