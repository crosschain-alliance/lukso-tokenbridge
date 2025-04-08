const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { addressToBytes32, getHyperlaneMessage } = require("../../test/utils");

const {
  getMessageFromDispatch,
  getMessageFromYaru,
  getMessageFromProcess,
} = require("../utils/index");

// To run the task
// 1. Create fork for mainnet: yarn hardhat node --fork $ETHEREUM_RPC_URL
// 2. Create fork for LUKSO: yarn hardhat node --fork $LUKSO_RPC_URL --port 8544
// 3. yarn hardhat token:e2e --network fethereum

task("token:e2e").setAction(async (_taskArgs, hre) => {
  const { ethers } = hre;
  const [owner] = await ethers.getSigners();

  const SOURCE_CHAIN_ID = 1;
  const DESTINATION_CHAIN_ID = 31337; // hardhat network chainID
  const HASHI_THRESHOLD = 2;
  const mockMessage = "0x12345678";
  const HYP_NONCE = 0; // nonce from Hyperlane message

  // ==== Deployment ====
  console.log("Deployment on Mainnet");
  const mailboxFactoryM = await ethers.getContractFactory("Mailbox");
  const mailboxM = await mailboxFactoryM.deploy(SOURCE_CHAIN_ID);

  const mockHookFactoryM = await ethers.getContractFactory("MockHook");
  const mockHookM = await mockHookFactoryM.deploy();

  // const hashiFactoryM = await ethers.getContractFactory("Hashi");
  // const hashiM = await hashiFactoryM.deploy();

  const yahoFactoryM = await ethers.getContractFactory("MockYaho");
  const yahoM = await yahoFactoryM.deploy();

  const yaruFactoryM = await ethers.getContractFactory("MockYaru");
  const yaruM = await yaruFactoryM.deploy(DESTINATION_CHAIN_ID);

  const headerStorageFactoryM =
    await ethers.getContractFactory("HeaderStorage");
  const headerStorageM = await headerStorageFactoryM.deploy();

  const mockReporterFactoryM = await ethers.getContractFactory("MockReporter");
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
  const mockRecipientM = await mockRecipientFactoryM.deploy();

  const hashiManagerFactoryM = await ethers.getContractFactory("HashiManager");
  const hashiManagerM = await hashiManagerFactoryM.deploy();

  const hashiISMFactoryM = await ethers.getContractFactory("HashiISM");
  const hashiISMM = await hashiISMFactoryM.deploy(
    await hashiManagerM.getAddress()
  );
  const mockERC20FactoryM = await ethers.getContractFactory("MockERC20");
  const mockERC20M = await mockERC20FactoryM.deploy();

  const hypERC20CollateralFactoryM =
    await ethers.getContractFactory("HypERC20Collateral");
  const hypERC20CollateralM = await hypERC20CollateralFactoryM.deploy(
    await mockERC20M.getAddress(),
    await mailboxM.getAddress()
  );

  const hypERC20FactoryM = await ethers.getContractFactory("HypERC20");
  const hypERC20M = await hypERC20FactoryM.deploy(
    18,
    await mailboxM.getAddress()
  );

  const mainnetAddress = {
    mailbox: await mailboxM.getAddress(),
    mockHook: await mockHookM.getAddress(),
    yaho: await yahoM.getAddress(),
    yaru: await yaruM.getAddress(),
    headerStorage: await headerStorageM.getAddress(),
    reporter1: await mockReporterM1.getAddress(),
    reporter2: await mockReporterM2.getAddress(),
    adapter1: await mockAdapterM1.getAddress(),
    adapter2: await mockAdapterM2.getAddress(),
    mockRecipient: await mockRecipientM.getAddress(),
    hashiManager: await hashiManagerM.getAddress(),
    hashiISM: await hashiISMM.getAddress(),
    mockERC20: await mockERC20M.getAddress(),
    hypERC20Collateral: await hypERC20CollateralM.getAddress(),
    hypERC20: await hypERC20M.getAddress(0),
  };

  console.log("Mainnet addresses: ", mainnetAddress);
  console.log("Switch to LUKSO network");
  await hre.changeNetwork("flukso");

  // ==== Deployment ====
  const mailboxFactoryL = await ethers.getContractFactory("Mailbox");
  const mailboxL = await mailboxFactoryL.deploy(DESTINATION_CHAIN_ID);

  const mockHookFactoryL = await ethers.getContractFactory("MockHook");
  const mockHookL = await mockHookFactoryL.deploy();

  // const hashiFactoryL = await ethers.getContractFactory("Hashi");
  // const hashiL = await hashiFactoryL.deploy();

  const yahoFactoryL = await ethers.getContractFactory("MockYaho");
  const yahoL = await yahoFactoryL.deploy();

  const yaruFactoryL = await ethers.getContractFactory("MockYaru");
  const yaruL = await yaruFactoryL.deploy(SOURCE_CHAIN_ID);

  const headerStorageFactoryL =
    await ethers.getContractFactory("HeaderStorage");
  const headerStorageL = await headerStorageFactoryL.deploy();

  const mockReporterFactoryL = await ethers.getContractFactory("MockReporter");
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

  const mockRecipientFactoryL =
    await ethers.getContractFactory("MockRecipient");
  const mockRecipientL = await mockRecipientFactoryL.deploy();

  const hashiManagerFactoryL = await ethers.getContractFactory("HashiManager");
  const hashiManagerL = await hashiManagerFactoryL.deploy();

  const hashiISMFactoryL = await ethers.getContractFactory("HashiISM");
  const hashiISML = await hashiISMFactoryL.deploy(
    await hashiManagerL.getAddress()
  );

  const hashiHookFactoryL = await ethers.getContractFactory("HashiHook");
  const hashiHookL = await hashiHookFactoryL.deploy(
    await mailboxL.getAddress(),
    await hashiManagerL.getAddress(),
    await hashiISMM.getAddress()
  );

  const mockERC20FactoryL = await ethers.getContractFactory("MockERC20");
  const mockERC20L = await mockERC20FactoryL.deploy();

  const hypERC20CollateralFactoryL =
    await ethers.getContractFactory("HypERC20Collateral");
  const hypERC20CollateralL = await hypERC20CollateralFactoryL.deploy(
    await mockERC20L.getAddress(),
    await mailboxL.getAddress()
  );

  const hypERC20FactoryL = await ethers.getContractFactory("HypERC20");
  const hypERC20L = await hypERC20FactoryL.deploy(
    18,
    await mailboxL.getAddress()
  );

  const LuksoAddress = {
    mailbox: await mailboxL.getAddress(),
    mockHook: await mockHookL.getAddress(),
    yaho: await yahoL.getAddress(),
    yaru: await yaruL.getAddress(),
    headerStorage: await headerStorageL.getAddress(),
    reporter1: await mockReporterL1.getAddress(),
    reporter2: await mockReporterL2.getAddress(),
    adapter1: await mockAdapterL1.getAddress(),
    adapter2: await mockAdapterL2.getAddress(),
    mockRecipient: await mockRecipientL.getAddress(),
    hashiManager: await hashiManagerL.getAddress(),
    hashiISM: await hashiISML.getAddress(),
    mockERC20: await mockERC20L.getAddress(),
    hypERC20Collateral: await hypERC20CollateralL.getAddress(),
    hypERC20: await hypERC20L.getAddress(),
  };

  console.log("LUKSO addresses ", LuksoAddress);
  console.log("Switch to Mainnet");
  await hre.changeNetwork("fethereum");

  const hashiHookFactoryM = await ethers.getContractFactory("HashiHook");
  const hashiHookM = await hashiHookFactoryM.deploy(
    await mailboxM.getAddress(),
    await hashiManagerM.getAddress(),
    await hashiISML.getAddress()
  );
  console.log("Configure Mainnet");
  await mailboxM.initialize(
    owner,
    await hashiISMM.getAddress(), // default ISM
    await mockHookM.getAddress(), // default Hook
    await hashiHookM.getAddress() // required Hook
  );

  await hashiManagerM.setYaho(await yahoM.getAddress());

  await hashiManagerM.setReportersAdaptersAndThreshold(
    [await mockReporterM1.getAddress(), await mockReporterM2.getAddress()],
    [await mockAdapterL1.getAddress(), await mockAdapterL2.getAddress()],
    HASHI_THRESHOLD
  );
  await hashiManagerM.setTargetChainId(DESTINATION_CHAIN_ID);

  await hashiManagerM.setExpectedAdaptersHash([
    await mockAdapterM1.getAddress(),
    await mockAdapterM2.getAddress(),
  ]);

  await hashiManagerM.setExpectedThreshold(HASHI_THRESHOLD);

  await hashiManagerM.setTargetAddress(await hashiHookL.getAddress());

  await hashiManagerM.setYaru(await yaruM.getAddress());

  await hre.changeNetwork("flukso");
  console.log("Configure LUKSO");

  await mailboxL.initialize(
    owner,
    await hashiISML.getAddress(), // default ISM
    await mockHookL.getAddress(), // default Hook
    await hashiHookL.getAddress() // required Hook
  );

  await hashiManagerL.setYaho(await yahoL.getAddress());

  await hashiManagerL.setReportersAdaptersAndThreshold(
    [await mockReporterL1.getAddress(), await mockReporterL2.getAddress()],
    [await mockAdapterM1.getAddress(), await mockAdapterM2.getAddress()],
    HASHI_THRESHOLD
  );

  await hashiManagerL.setExpectedAdaptersHash([
    await mockAdapterL1.getAddress(),
    await mockAdapterL2.getAddress(),
  ]);

  await hashiManagerL.setExpectedThreshold(HASHI_THRESHOLD);
  await hashiManagerL.setTargetChainId(SOURCE_CHAIN_ID);

  await hashiManagerL.setTargetAddress(await hashiHookM.getAddress());

  await hashiManagerL.setYaru(await yaruL.getAddress());

  console.log("Deployment & Configuration Done");

  await hre.changeNetwork("fethereum");

  console.log("Relaying token from Mainnet");
  const hyperlaneMessageFromM = getHyperlaneMessage({
    nonce: HYP_NONCE,
    originDomain: SOURCE_CHAIN_ID,
    sender: owner.address,
    destinationDomain: DESTINATION_CHAIN_ID,
    recipient: (await mockRecipientL.getAddress()).toString(), // recipient on the destination chain must be a contract
    message: mockMessage,
  });

  const hashiMessageFromM = {
    nonce: 0,
    targetChainId: DESTINATION_CHAIN_ID,
    threshold: HASHI_THRESHOLD,
    sender: await hashiHookM.getAddress(), // sender is the HashiHook
    receiver: await hashiISML.getAddress(),
    data: hyperlaneMessageFromM,
    reporters: [
      await mockReporterM1.getAddress(),
      await mockReporterM2.getAddress(),
    ],
    adapters: [
      await mockAdapterL1.getAddress(),
      await mockAdapterL2.getAddress(),
    ],
  };

  console.log("Hashi Message ", hashiMessageFromM);
  let dispatchTxM = await mailboxM.dispatch(
    DESTINATION_CHAIN_ID,
    addressToBytes32(owner.address), // recipient
    mockMessage
  );

  const dispatchReceiptM = await dispatchTxM.wait();
  getMessageFromDispatch({ receipt: dispatchReceiptM });

  await hre.changeNetwork("flukso");

  console.log("Execute on LUKSO");

  let yaruTx = await yaruL.executeMessages([hashiMessageFromM]);
  const yaruReceipt = await yaruTx.wait();
  getMessageFromYaru({ receipt: yaruReceipt });

  let processTx = await mailboxL.process("0x00", hyperlaneMessageFromM);
  const processReceipt = await processTx.wait();
  getMessageFromProcess({ receipt: processReceipt });

  console.log("Message processed by Mailbox on LUKSO");

  //==== Dispatch from LUKSO =====
  await hre.changeNetwork("flukso");

  console.log("Dispatch from LUKSO");

  const hyperlaneMessageFromL = getHyperlaneMessage({
    nonce: HYP_NONCE,
    originDomain: DESTINATION_CHAIN_ID,
    sender: owner.address,
    destinationDomain: SOURCE_CHAIN_ID,
    recipient: (await mockRecipientM.getAddress()).toString(), // recipient on the destination chain must be a contract
    message: mockMessage,
  });

  const hashiMessageFromL = {
    nonce: 0,
    targetChainId: SOURCE_CHAIN_ID,
    threshold: HASHI_THRESHOLD,
    sender: await hashiHookL.getAddress(), // sender is the HashiHook
    receiver: await hashiISMM.getAddress(),
    data: hyperlaneMessageFromL,
    reporters: [
      await mockReporterL1.getAddress(),
      await mockReporterL2.getAddress(),
    ],
    adapters: [
      await mockAdapterM1.getAddress(),
      await mockAdapterM2.getAddress(),
    ],
  };

  let dispatchTxL = await mailboxL.dispatch(
    SOURCE_CHAIN_ID,
    addressToBytes32(owner.address), // recipient
    mockMessage
  );

  const dispatchReceiptL = await dispatchTxL.wait();

  getMessageFromDispatch({ receipt: dispatchReceiptL });

  await hre.changeNetwork("fethereum");

  console.log("Execute on Mainnet");
  let yaruTxM = await yaruM.executeMessages([hashiMessageFromL]);
  const yaruReceiptM = await yaruTxM.wait();
  getMessageFromYaru({ receipt: yaruReceiptM });

  let processTxM = await mailboxM.process("0x00", hyperlaneMessageFromL);
  const processReceiptM = await processTxM.wait();
  getMessageFromProcess({ receipt: processReceiptM });

  console.log("Message processed by Mailbox on Mainnet");
});
