# Developer Challenge

This project is a DApp to track flights for an airline. It provides both a user and administrator interface, with all data stored on-chain. 

## Stack
* Frontend: React
* Backend: Express
* Smart Contract: Solidity
* Blockchain Interaction: Hyperledger FireFly

## Operation
The DApp has the same components as the provided developer-challenge repo so to get it running:
1. Deploy the solidity contracts 
```
cd solidity
npx hardhat run scripts/deploy.ts --network firefly
```
2. Start the backend
```
cd backend
npm start
```
3. Start the frontend
```
cd frontend
npm start
```