const { task } = require("hardhat/config");
const { Typed } = require("ethers");
const fs = require("fs");
const path = require("path");

require("@nomicfoundation/hardhat-toolbox/network-helpers");

/// @Dev This setup script deploy the Aggregation Hook and Aggregation ISM that is used for HypERC20 token
/// By default, the source chain is Ethereum
/// Run: yarn hardhat setup:hookAndIsm --network ethereum
task("setup:hookAndIsm").setAction(async (_taskArgs, hre) => {
  const { ethers, network } = hre;

  let signers = await ethers.getSigners();
  const owner = signers[0];
  console.log(`Current network: ${network.name}`);

  const ethStaticAggregationHookFactoryAddress =
    process.env.ETHEREUM_STATIC_AGGREGATION_HOOK_FACTORY;
  const ethStaticAggregationISMFactoryAddress =
    process.env.ETHEREUM_STATIC_AGGREGATION_ISM_FACTORY;
  const ethMailboxAddress = process.env.ETHEREUM_MAILBOX;
  const ismThreshold = process.env.ISM_THRESHOLD;
  const hookThreshold = process.env.HOOK_THRESHOLD;
  const ethHashiHookAddress = process.env.ETHEREUM_HASHI_HOOK;
  const ethHashiISMAddress = process.env.ETHEREUM_HASHI_ISM;
  const ethMerkleRootMultisigISMAddress =
    process.env.ETHEREUM_MERKLE_ROOT_MULTISIG_ISM;

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
      Typed.uint8(hookThreshold)
    );
  // TODO: fetch created contract address from receipt
  let ethAggregationHookAddress = await ethDeployAggregationHookTx.wait();
  console.log(`New aggregation Hook tx ${ethAggregationHookAddress.hash}`);

  // deploy Aggregation ISM that includes default ISM, hashi ISM, MultisigISM (validator)

  const ethDeployAggregationISMTx = await staticAggregationISMFactory
    .connect(owner)
    .deploy(
      [
        Typed.address(ethDefaultISM),
        Typed.address(ethHashiISMAddress),
        Typed.address(ethMerkleRootMultisigISMAddress),
      ],
      Typed.uint8(ismThreshold)
    );

  // TODO: fetch created contract address from receipt
  let ethAggregationISMAddress = await ethDeployAggregationISMTx.wait();
  console.log(`New aggregation ISM tx ${ethAggregationISMAddress.hash}`);

  await hre.changeNetwork("lukso");
  console.log("current network ", network.name);
  let luksoSigners = await ethers.getSigners();
  const lukOwner = luksoSigners[0];

  const lukAggregationHookFactoryAddress =
    process.env.LUKSO_STATIC_AGGREGATION_HOOK_FACTORY;
  const lukAggregationISMFactoryAddress =
    process.env.LUKSO_STATIC_AGGREGATION_ISM_FACTORY;
  const lukMailboxAddress = process.env.LUKSO_MAILBOX;
  const lukHashiMookAddress = process.env.LUKSO_HASHI_HOOK;
  const lukHashiISMAddress = process.env.LUKSO_HASHI_ISM;
  const lukMerkleRootMultisigISMAddress =
    process.env.LUKSO_MERKLE_ROOT_MULTISIG_ISM;

  staticAggregationHookFactory = staticAggregationHookFactory.attach(
    lukAggregationHookFactoryAddress
  );

  staticAggregationISMFactory = staticAggregationISMFactory.attach(
    lukAggregationISMFactoryAddress
  );

  let lukMailbox = await hre.ethers.getContractFactory("Mailbox");
  lukMailbox = lukMailbox.attach(lukMailboxAddress);

  const lukDefaultHook = await lukMailbox.defaultHook();
  const lukDefaultISM = await lukMailbox.defaultIsm();

  let lukDeployAggregationHookTx = await staticAggregationHookFactory
    .connect(lukOwner)
    .deploy(
      [Typed.address(lukDefaultHook), Typed.address(lukHashiMookAddress)],
      Typed.uint8(hookThreshold)
    );
  // TODO: fetch created contract address from receipt
  const lukAggregationHookAddress = await lukDeployAggregationHookTx.wait();
  console.log("LUK Aggregation Hook tx ", lukAggregationHookAddress.hash);
  let lukDeployAggregationISMTx = await staticAggregationISMFactory
    .connect(lukOwner)
    .deploy(
      [
        Typed.address(lukDefaultISM),
        Typed.address(lukHashiISMAddress),
        Typed.address(lukMerkleRootMultisigISMAddress),
      ],
      Typed.uint8(ismThreshold)
    );
  // TODO: fetch created contract address from receipt
  const lukAggregationISMAddress = await lukDeployAggregationISMTx.wait();

  console.log("LUK Aggregation ISM tx ", lukAggregationISMAddress.hash);
});
