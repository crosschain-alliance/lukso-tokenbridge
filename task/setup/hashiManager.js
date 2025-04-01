const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox/network-helpers");

/// Setup the Hashi components: Hashi Manager, reporters, adapters
/// By default, the source chain is Ethereum
/// Run: yarn hardhat setup:hashiManager --network ethereum
task("setup:hashiManager")
  .addParam("sourcechain")
  .addParam("targetchain")
  .setAction(async (_taskArgs, hre) => {
    const { ethers, network } = hre;
    const [owner] = await ethers.getSigners();

    const SOURCE_CHAIN_ID = process.env.SOURCE_CHAIN_ID;
    const DESTINATION_CHAIN_ID = process.env.DESTINATION_CHAIN_ID;
    const hashiManagerThreshold = process.env.HASHI_MANAGER_THRESHOLD;

    // ==== Deployment ====

    console.log(`Deploying on ${network.name}`);
    const mailboxM = await ethers.getContractAt(
      "Mailbox",
      process.env[`${process.env.SOURCE_CHAIN_NAME}_MAILBOX`]
    );

    const yahoM = await ethers.getContractAt(
      "Yaho",
      process.env[`${process.env.SOURCE_CHAIN_NAME}_YAHO`]
    );

    const yaruM = await ethers.getContractAt(
      "Yaru",
      process.env[`${process.env.SOURCE_CHAIN_NAME}_YARU`]
    );

    const headerStorageM = await ethers.getContractAt(
      "HeaderStorage",
      process.env[`${process.env.SOURCE_CHAIN_NAME}_HEADER_STORAGE`]
    );

    const mockReporterFactoryM =
      await ethers.getContractFactory("MockReporter");
    const mockReporterM1 = await mockReporterFactoryM.deploy(
      await headerStorageM.getAddress(),
      await yahoM.getAddress()
    );

    const mockReporterM2 = await mockReporterFactoryM.deploy(
      await headerStorageM.getAddress(),
      await yahoM.getAddress()
    );

    const mockAdapterFactoryM = await ethers.getContractFactory("MockAdapter");
    const mockAdapterM1 = await mockAdapterFactoryM.deploy();
    const mockAdapterM2 = await mockAdapterFactoryM.deploy();

    const mockRecipientFactoryM =
      await ethers.getContractFactory("MockRecipient");

    const hashiManagerFactoryM =
      await ethers.getContractFactory("HashiManager");
    const hashiManagerM = await hashiManagerFactoryM.deploy();
    console.log("Hashi Manager M: ", hashiManagerM.hash);

    const hashiISMFactoryM = await ethers.getContractFactory("HashiISM");
    const hashiISMM = await hashiISMFactoryM.deploy(
      await hashiManagerM.getAddress()
    );
    console.log("Hashi ISM M ", hashiISMM.hash);
    await hre.changeNetwork(_taskArgs.targetchain);
    console.log("Switch to LUKSO network");

    // ==== Deployment ====
    const mailboxL = await ethers.getContractAt(
      "Mailbox",
      process.env[`${process.env.DESTINATION_CHAIN_NAME}_MAILBOX`]
    );

    const yahoL = await ethers.getContractAt(
      "Yaho",
      process.env[`${process.env.DESTINATION_CHAIN_NAME}_YAHO`]
    );

    const yaruL = await ethers.getContractAt(
      "Yaru",
      process.env[`${process.env.DESTINATION_CHAIN_NAME}_YARU`]
    );

    const headerStorageL = await ethers.getContractAt(
      "HeaderStorage",
      process.env[`${process.env.DESTINATION_CHAIN_NAME}_HEADER_STORAGE`]
    );

    const mockReporterFactoryL =
      await ethers.getContractFactory("MockReporter");
    const mockReporterL1 = await mockReporterFactoryL.deploy(
      await headerStorageL.getAddress(),
      await yahoL.getAddress()
    );

    const mockReporterL2 = await mockReporterFactoryL.deploy(
      await headerStorageL.getAddress(),
      await yahoL.getAddress()
    );

    const mockAdapterFactoryL = await ethers.getContractFactory("MockAdapter");
    const mockAdapterL1 = await mockAdapterFactoryL.deploy();
    const mockAdapterL2 = await mockAdapterFactoryL.deploy();

    const hashiManagerFactoryL =
      await ethers.getContractFactory("HashiManager");
    const hashiManagerL = await hashiManagerFactoryL.deploy();

    console.log("Hashi Manager L", hashiManagerL.hash);
    const hashiISMFactoryL = await ethers.getContractFactory("HashiISM");
    const hashiISML = await hashiISMFactoryL.deploy(
      await hashiManagerL.getAddress()
    );
    console.log("Hashi ISM L ", hashiISML.hash);

    const hashiHookFactoryL = await ethers.getContractFactory("HashiHook");
    const hashiHookL = await hashiHookFactoryL.deploy(
      await mailboxL.getAddress(),
      await hashiManagerL.getAddress(),
      await hashiISMM.getAddress()
    );

    console.log("Hashi Hook L", hashiHookL.hash);
    await hre.changeNetwork(_taskArgs.sourcechain);

    console.log("Switch to Ethereum");

    const hashiHookFactoryM = await ethers.getContractFactory("HashiHook");
    const hashiHookM = await hashiHookFactoryM.deploy(
      await mailboxM.getAddress(),
      await hashiManagerM.getAddress(),
      await hashiISML.getAddress()
    );

    console.log("Hashi Hook M", hashiHookM.hash);
    console.log("Configure Mainnet");

    await hashiManagerM.setYaho(await yahoM.getAddress());

    await hashiManagerM.setReportersAdaptersAndThreshold(
      [await mockReporterM1.getAddress(), await mockReporterM2.getAddress()],
      [await mockAdapterL1.getAddress(), await mockAdapterL2.getAddress()],
      hashiManagerThreshold
    );

    await hashiManagerM.setTargetChainId(DESTINATION_CHAIN_ID);

    await hashiManagerM.setExpectedAdaptersHash([
      await mockAdapterM1.getAddress(),
      await mockAdapterM2.getAddress(),
    ]);

    await hashiManagerM.setExpectedThreshold(hashiManagerThreshold);

    await hashiManagerM.setTargetAddress(await hashiHookL.getAddress());

    await hashiManagerM.setYaru(await yaruM.getAddress());

    await hre.changeNetwork(_taskArgs.targetchain);

    console.log("Configure LUKSO");

    await hashiManagerL.setYaho(await yahoL.getAddress());

    await hashiManagerL.setReportersAdaptersAndThreshold(
      [await mockReporterL1.getAddress(), await mockReporterL2.getAddress()],
      [await mockAdapterM1.getAddress(), await mockAdapterM2.getAddress()],
      hashiManagerThreshold
    );

    await hashiManagerL.setExpectedAdaptersHash([
      await mockAdapterL1.getAddress(),
      await mockAdapterL2.getAddress(),
    ]);

    await hashiManagerL.setExpectedThreshold(hashiManagerThreshold);

    await hashiManagerL.setTargetChainId(SOURCE_CHAIN_ID);

    await hashiManagerL.setTargetAddress(await hashiHookM.getAddress());

    await hashiManagerL.setYaru(await yaruL.getAddress());

    console.log("Deployment & Configuration Done");
  });
