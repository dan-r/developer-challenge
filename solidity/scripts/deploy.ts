import { ethers } from "hardhat";


const path = require('path');
const fs = require('fs');


async function main() {
  const Airline = await ethers.getContractFactory("Airline");
  const airline = await Airline.deploy();
  await airline.deployed();

  console.log(`AIRLINE_ADDRESS: ${airline.address}`);

  const fileName = path.resolve('../backend/config.json');
  const file = require(fileName);

  file.VERSION = (parseInt(file.VERSION) + 1).toString();
  file.AIRLINE_ADDRESS = airline.address;

  fs.writeFileSync(fileName, JSON.stringify(file), function writeJSON(err: any) {
    if (err) return console.log(err);
    console.log(JSON.stringify(file));
    console.log('writing to ' + fileName);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
