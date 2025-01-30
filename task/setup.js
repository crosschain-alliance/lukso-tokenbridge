const { task } = require("hardhat/config");
const { Typed } = require("ethers");

require("@nomicfoundation/hardhat-toolbox/network-helpers");

const {
  getRelevantDataFromEvents,
  decodeHashiMessage,
} = require("./utils/index");

task("setup").setAction(async (_taskArgs, hre) => {
  const { ethers, network } = hre;
  const abiCoder = new ethers.AbiCoder();
  let signers = await ethers.getSigners();
  const owner = signers[0];

  const ERC20Address = process.env.ERC20;
  const ethStaticAggregationHookFactoryAddress =
    process.env.ETHEREUM_STATIC_AGGREGATION_HOOK_FACTORY;
  const ethStaticAggregationISMFactoryAddress =
    process.env.ETHEREUM_STATIC_AGGREGATION_ISM_FACTORY;
  const ethMailboxAddress = process.env.ETHEREUM_MAILBOX;
  const threshold = 2;
  const ethHashiHookAddress = process.env.ETHEREUM_HASHI_HOOK;
  const ethHashiISMAddress = process.env.ETHEREUM_HASHI_ISM;

  //   1. Deploy HypERC20Collateral for the ERC20 token
  let HypERC20CollateralFactory =
    await hre.ethers.getContractFactory("HypERC20Collateral");
  let hypERC20Collateral = await HypERC20CollateralFactory.connect(
    owner
  ).deploy(ERC20Address, ethMailboxAddress);

  console.log(
    "hypERC20Collateral deployed to ",
    await hypERC20Collateral.getAddress()
  );

  let staticAggregationHookFactory = await hre.ethers.getContractFactory(
    "StaticAggregationHookFactory"
  );
  staticAggregationHookFactory = staticAggregationHookFactory.attach(
    ethStaticAggregationHookFactoryAddress
  );
  let staticAggregationISMFactory = await hre.ethers.getContractFactory(
    "StaticAggregationIsmFactory"
  );
  staticAggregationISMFactory = staticAggregationISMFactory.attach(
    ethStaticAggregationISMFactoryAddress
  );
  let ethMailbox = await hre.ethers.getContractFactory("Mailbox");
  ethMailbox = ethMailbox.attach(ethMailboxAddress);

  const ethDefaultHook = await ethMailbox.defaultHook();
  const ethDefaultISM = await ethMailbox.defaultIsm();

  // deploy Aggregation Hook that includes default hook & hashi hook
  const ethDeployAggregationHookTx = await staticAggregationHookFactory
    .connect(owner)
    .deploy(
      [Typed.address(ethDefaultHook), Typed.address(ethHashiHookAddress)],
      Typed.uint8(threshold)
    );
  let ethAggregationHookAddress = await ethDeployAggregationHookTx.wait();
  console.log(`New aggregation Hook deployed to ${ethAggregationHookAddress}`);

  // deploy Aggregation ISM that includes default ISM & hashi hook

  const ethDeployAggregationISMTx = await staticAggregationISMFactory
    .connect(owner)
    .deploy(
      [Typed.address(ethDefaultISM), Typed.address(ethHashiISMAddress)],
      Typed.uint8(threshold)
    );
  let ethAggregationISMAddress = await ethDeployAggregationISMTx.wait();
  console.log(`New aggregation Hook deployed to ${ethAggregationISMAddress}`);

  await hre.changeNetwork("lukso");
  let luksoSigners = await ethers.getSigners();
  const lukOwner = luksoSigners[0];

  const lukAggregationHookFactoryAddress =
    process.env.LUKSO_STATIC_AGGREGATION_HOOK_FACTORY;
  const lukAggregationISMFactoryAddress =
    process.env.LUKSO_STATIC_AGGREGATION_ISM_FACTORY;
  const lukMailboxAddress = process.env.LUKSO_MAILBOX;
  const lukHashiMookAddress = process.env.LUKSO_HASHI_HOOK;
  const lukHashiISMAddress = process.env.LUKSO_HASHI_ISM;

  const decimals = 18;

  let hypERC20Factory = await hre.ethers.getContractFactory("HypERC20");
  let hypERC20 = await hypERC20Factory
    .connect(owner)
    .deploy(decimals, lukMailboxAddress);

  staticAggregationHookFactory = staticAggregationHookFactory.attach(
    lukAggregationHookFactoryAddress
  );

  staticAggregationISMFactory = staticAggregationISMFactory.attach(
    lukAggregationISMFactoryAddress
  );

  const lukDefaultHook = await lukMailboxAddress.defaultHook();
  const lukDefaultISM = await lukMailboxAddress.defaultIsm();
  let lukDeployAggregationHookTx = await staticAggregationHookFactory
    .connect(lukOwner)
    .deploy([lukDefaultHook, lukHashiMookAddress], threshold);

  const lukAggregationHookAddress = await lukDeployAggregationHookTx.wait();
  console.log("LUK Aggregation Hook ", lukAggregationHookAddress);
  let lukDeployAggregationISMTx = await staticAggregationISMFactory
    .connect(lukOwner)
    .deploy([lukDefaultISM, lukHashiISMAddress], threshold);
  const lukAggregationISMAddress = await lukDeployAggregationISMTx.wait();

  console.log("LUK Aggregation ISM ", lukAggregationISMAddress);
  const hypERC20InitializeTx = await hypERC20.initialize(
    1e20,
    "LYX token",
    "LYX",
    lukAggregationHookAddress,
    lukAggregationISMAddress,
    lukOwner.address
  );

  console.log("Initialize tx ", hypERC20InitializeTx.hash);
});
