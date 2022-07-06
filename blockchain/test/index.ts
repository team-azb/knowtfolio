import { ethers } from "hardhat";

describe("Knowtfolio", function () {
  it("title", async function () {
    const Knowtfolio = await ethers.getContractFactory("Knowtfolio");
    const knowtfolio = await Knowtfolio.deploy();
    await knowtfolio.deployed();

    // wirte test code below
  });
});
