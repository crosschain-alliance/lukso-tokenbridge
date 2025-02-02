const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { Typed } = require("ethers");

task("deploy:HypERC20Collateral")
  .addParam("collateral")
  .addParam("mailbox")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying HypERC20Colalteral...");
    const signers = await hre.ethers.getSigners();

    const hypERC20ColalteralFactory =
      await hre.ethers.getContractFactory("HypERC20Collateral");
    let hypERC20Collateral = await hypERC20ColalteralFactory
      .connect(signers[0])
      .deploy(taskArguments.collateral, taskArguments.mailbox);

    console.log(
      "hypERC20Collateral deployed to ",
      await hypERC20Collateral.getAddress()
    );

    await hre.run("verify:verify", {
      address: await hypERC20Collateral.getAddress(),
      constructor: [taskArguments.collateral, taskArguments.mailbox],
    });
  });

task("deploy:MockReporter")
  .addParam("headerstorage")
  .addParam("yaho")
  .addFlag("verify")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying MockReporter...");
    const signers = await hre.ethers.getSigners();
    const MockReporterFactory =
      await hre.ethers.getContractFactory("MockReporter");

    const mockReporter = await MockReporterFactory.connect(signers[0]).deploy(
      taskArguments.headerstorage,
      taskArguments.yaho
    );
    await mockReporter.deploymentTransaction().wait();
    console.log("mockReporter deployed to:", await mockReporter.getAddress());

    await hre.run("verify:verify", {
      address: await mockReporter.getAddress(),
      constructor: [taskArguments.headerstorage, taskArguments.yaho],
    });
  });

task("deploy:MockAdapter").setAction(async function (taskArguments, hre) {
  console.log("Deploying MockAdapter...");
  const signers = await hre.ethers.getSigners();
  const MockAdapterFactory = await hre.ethers.getContractFactory("MockAdapter");

  const mockAdapter = await MockAdapterFactory.connect(signers[0]).deploy();
  await mockAdapter.deploymentTransaction().wait();
  console.log("mockAdapter deployed to:", await mockAdapter.getAddress());

  await hre.run("verify:verify", {
    address: await mockAdapter.getAddress(),
    constructor: [],
  });
});

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
    await hashiISM.deploymentTransaction().wait();
    console.log("hashiISM deployed to:", await hashiISM.getAddress());

    await hre.run("verify:verify", {
      address: await hashiISM.getAddress(),
      constructor: [taskArguments.hashimanager],
    });
  });

task("deploy:MockHashiISM")
  .addParam("hashimanager")
  .addFlag("verify")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying Hashi ISM...");
    const signers = await hre.ethers.getSigners();
    const hashiISMFactory = await hre.ethers.getContractFactory("MockHashiISM");

    const hashiISM = await hashiISMFactory
      .connect(signers[0])
      .deploy(taskArguments.hashimanager);
    await hashiISM.deploymentTransaction().wait();
    console.log("hashiISM deployed to:", await hashiISM.getAddress());

    await hre.run("verify:verify", {
      address: await hashiISM.getAddress(),
      constructor: [taskArguments.hashimanager],
    });
  });

task("deploy:StaticAggregationHook")
  .addParam("factory")
  .addParam("threshold")
  .addParam("hashihook")
  .addParam("defaulthook")
  .setAction(async function (taskArgumetns, hre) {
    const signers = await hre.ethers.getSigners();
    const aggregationHookFactory = await hre.ethers.getContractAt(
      "StaticAggregationHookFactory",
      taskArgumetns.factory
    );

    const aggregationHook = await aggregationHookFactory
      .connect(signers[0])
      .deploy(
        [
          Typed.address(taskArgumetns.defaulthook),
          Typed.address(taskArgumetns.hashihook),
        ],
        Typed.uint8(taskArgumetns.threshold)
      );
    console.log("Static Aggregation Hook deploy tx:", aggregationHook.hash);
  });

task("deploy:StaticAggregationIsm")
  .addParam("factory")
  .addParam("hashiism")
  .addParam("multisigism")
  .addParam("defaultism")
  .addParam("threshold")
  .setAction(async function (taskArguments, hre) {
    const signers = await hre.ethers.getSigners();
    const aggregationISMFactory = await hre.ethers.getContractAt(
      "StaticAggregationIsmFactory",
      taskArguments.factory
    );
    const aggregationISM = await aggregationISMFactory
      .connect(signers[0])
      .deploy(
        [
          Typed.address(taskArguments.hashiism),
          Typed.address(taskArguments.multisigism),
          Typed.address(taskArguments.defaultism),
        ],
        Typed.uint8(taskArguments.threshold)
      );
    console.log("Static Aggregation ISM deploy tx: ", aggregationISM.hash);
  });

task("deploy:HashiManager").setAction(async function (taskArguments, hre) {
  console.log("Deploying Hashi Manager");
  const signers = await hre.ethers.getSigners();
  const hashiManagerFactory =
    await hre.ethers.getContractFactory("HashiManager");
  const hashiManager = await hashiManagerFactory.connect(signers[0]).deploy();
  await hashiManager.deploymentTransaction().wait();
  console.log("Hashi manager dpeloyed to ", await hashiManager.getAddress());

  await hre.run("verify:verify", {
    address: await hashiManager.getAddress(),
    constructor: [],
  });
});

task("deploy:HashiHook")
  .addParam("mailbox")
  .addParam("hashimanager")
  .addParam("hashiism")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying Hashi Hook");

    const signers = await hre.ethers.getSigners();
    const hashiHookFactory = await hre.ethers.getContractFactory("HashiHook");
    const hashiHook = await hashiHookFactory
      .connect(signers[0])
      .deploy(
        taskArguments.mailbox,
        taskArguments.hashimanager,
        taskArguments.hashiism
      );

    await hashiHook.deploymentTransaction().wait();
    console.log("Hashi hook deployed to ", await hashiHook.getAddress());
    await hre.run("verify:verify", {
      address: await hashiHook.getAddress(),
      constructor: [
        taskArguments.mailbox,
        taskArguments.hashimanager,
        taskArguments.hashiism,
      ],
    });
  });

task("deploy:MockERC20").setAction(async function (taskArguments, hre) {
  console.log("Deploying Mock ERC20...");
  const signers = await hre.ethers.getSigners();
  const erc20Factory = await hre.ethers.getContractFactory("MockERC20");
  const erc20 = await erc20Factory.connect(signers[0]).deploy();

  console.log("Erc20 deployed to ", await erc20.getAddress());
  await hre.run("verify:verify", {
    address: await erc20.getAddress(),
    constructor: [],
  });
});

task("deploy:HypERC20")
  .addParam("decimal")
  .addParam("mailbox")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying HypERC20...");
    const signers = await hre.ethers.getSigners();
    const hypERC20Factory = await hre.ethers.getContractFactory("HypERC20");
    const hypERC20 = await hypERC20Factory
      .connect(signers[0])
      .deploy(taskArguments.decimal, taskArguments.mailbox);

    console.log("hyperc20 ", await hypERC20.getAddress());
    await hre.run("verify:verify", {
      address: await hypERC20.getAddress(),
      constructor: [taskArguments.decimal, taskArguments.mailbox],
    });
  });

task("deploy:MockHook").setAction(async function (taskArguments, hre) {
  console.log("Deploying MockHook");
  const signers = await hre.ethers.getSigners();

  const mockHookFactory = await hre.ethers.getContractFactory("MockHook");
  const mockHook = await mockHookFactory.connect(signers[0]).deploy();
  console.log("mock hook deployed to ", await mockHook.getAddress());
  await hre.run("verify:verify", {
    address: await mockHook.getAddress(),
    constructor: [],
  });
});

task("deploy:MockISM").setAction(async function (taskArguments, hre) {
  console.log("Deploying MockISM");
  const signers = await hre.ethers.getSigners();
  const mockISMFactory = await hre.ethers.getContractFactory("MockISM");
  const mockISM = await mockISMFactory.connect(signers[0]).deploy();
  console.log("mockISM deployed to ", await mockISM.getAddress());

  await hre.run("verify:verify", {
    address: await mockISM.getAddress(),
    constructor: [],
  });
});

task("deploy:MerkleRootMultisigISM")
  .addParam("threshold")
  .addParam("validator")
  .addParam("factory")
  .setAction(async function (taskArguments, hre) {
    console.log("Deploying MultisigISM...");
    const signers = await hre.ethers.getSigners();
    const MultisigISMFactory = await hre.ethers.getContractAt(
      "StaticMerkleRootMultisigIsmFactory",
      taskArguments.factory
    );

    const tx = await MultisigISMFactory.connect(signers[0]).deploy(
      [taskArguments.validator],
      taskArguments.threshold
    );

    console.log("MerkleRootMultisigISM deploy tx ", tx.hash);
  });
