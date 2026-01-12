import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  console.log("Deploying RahmanCoin...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  const token = await ethers.deployContract("RahmanCoin");
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("\u2705 RahmanCoin deployed to:", address);
  console.log("\ud83c\udf89 View on Etherscan: https://sepolia.etherscan.io/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
