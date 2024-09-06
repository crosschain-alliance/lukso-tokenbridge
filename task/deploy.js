const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox/network-helpers");

task("deploy:HashiISM")
  .addParam("hashimanager")
  .addFlag("verify")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying Hashi ISM...");
    const signers = await hre.ethers.getSigners();
    const hashiISMFactory = await hre.ethers.getContractFactory("HashiISM");

    const hashiISM = await hashiISMFactory
      .connect(signers[0])
      .deploy(taskArguments.hashimanager);
    await hashiISM.deployed();
    console.log("hashiISM deployed to:", hashiISM.address);

    await hre.run("verify:verify", {
      address: hashiISM.address,
      constructor: [taskArguments.hashimanager],
    });
  });
