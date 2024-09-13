# Developer Challenge

A DApp that tracks flights for an airline and provides a user and administrator interface. All data is held on-chain.

## Stack
* React Frontend
* Express Backend
* Smart contract written in Solidity
* Uses Hyperledger FireFly to interact with the blockchain

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