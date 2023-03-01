// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
import "@openzeppelin/hardhat-upgrades";
import { assert } from "console";
// import Knowtfolio from "../artifacts/contracts/Knowtfolio.sol/Knowtfolio.json";

const proxyAddress = process.env.CONTRACT_ADDRESS;

async function main() {
  if (!proxyAddress) {
    assert("Could not read CONTRACT_ADDRESS...");
    return;
  } else {
    console.log("Upgrade contract of", proxyAddress);
  }

  // We get the contract to deploy
  const KnowtfolioV2 = await ethers.getContractFactory("KnowtfolioV2");
  const knowtfoliov2 = await upgrades.upgradeProxy(proxyAddress, KnowtfolioV2);
  console.log(knowtfoliov2.address, " Knowtfolio(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(knowtfoliov2.address),
    " getImplementationAddress"
  );
  console.log(
    await upgrades.erc1967.getAdminAddress(knowtfoliov2.address),
    " getAdminAddress"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
