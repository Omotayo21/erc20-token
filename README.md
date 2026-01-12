# Decentralized Escrow dApp

A sleek, glassmorphism-designed Decentralized Escrow application built with Solidity and React (Vite).

## Features
- **Factory Pattern**: Deploy unique escrow contracts directly from the frontend.
- **Three-Role System**: Involves a Depositor, a Beneficiary, and an Arbiter.
- **Network Aware**: Detects and displays whether you are on Hardhat Local or Sepolia Testnet.
- **Glassmorphism UI**: Beautiful, modern design with smooth animations.

## Tech Stack
- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: React, Vite, Ethers.js
- **Deployment**: Vercel ready

## Getting Started

### 1. Smart Contracts
```bash
# Install dependencies
npm install

# Run tests
npx hardhat test

# Run a local node
npx hardhat node
```

### 2. Frontend
```bash
cd app
npm install
npm run dev
```

## How to deploy to Sepolia
1. Switch your MetaMask to the **Sepolia Testnet**.
2. Ensure you have some Sepolia ETH.
3. Open the app and fill in the Arbiter and Beneficiary addresses.
4. Click **Create Escrow**.
5. MetaMask will prompt you to deploy the contract on Sepolia!

## Vercel Hosting
Import this repo to Vercel, set the **Root Directory** to `app`, and use the Vite preset.
