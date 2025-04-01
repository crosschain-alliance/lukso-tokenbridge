const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox/network-helpers");

/// Setup HypERC20 Collateral on source chain, HypERC20 on destination chain
/// By default, the source chain is Ethereum
/// Run: yarn hardhat setup:hypERC20 --network ethereum
task("setup:hypERC20")
  .addParam("tokenname")
  .addParam("tokensymbol")
  .addParam("totalsupply")
  .setAction(async (_taskArgs, hre) => {
    const { ethers, network } = hre;
    const [owner] = await ethers.getSigners();

    const ERC20Address = process.env.ERC20_ADDRESS;

    const ethMailboxAddress =
      process.env[`${process.env.SOURCE_CHAIN_NAME}_MAILBOX`];
    const lukMailboxAddress =
      process.env[`${process.env.DESTINATION_CHAIN_ID}_MAILBOX`];

    const decimals = 18;

    await hre.changeNetwork(network.name);
    console.log(`Deploying HypERC20 Collateral on ${network.name}`);
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

    await hre.changeNetwork("lukso");

    //   2. Deploy HypERC20 on LUKSO
    let hypERC20Factory = await hre.ethers.getContractFactory("HypERC20");
    let hypERC20 = await hypERC20Factory
      .connect(owner)
      .deploy(decimals, lukMailboxAddress);

    const hypERC20InitializeTx = await hypERC20.initialize(
      _taskArgs.totalsupply,
      _taskArgs.tokenname,
      _taskArgs.tokensymbol,
      process.env[`${process.env.DESTINATION_CHAIN_ID}_STATIC_AGGREGATON_HOOK`], // Dev: need to check the newly created
      process.env[`${process.env.DESTINATION_CHAIN_ID}_STATIC_AGGREGATON_ISM`],
      owner.address
    );

    console.log("Initialize tx ", hypERC20InitializeTx.hash);
  });
