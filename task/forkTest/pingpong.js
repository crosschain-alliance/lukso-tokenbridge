const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox/network-helpers");

const {
  getRelevantDataFromEvents,
  decodeHashiMessage,
} = require("../utils/index");

// To run the task
// 1. Create fork for Sepolia: yarn hardhat node --fork https://rpc.sepolia.org
// 2. Create fork for LUKSO testnet: anvil --fork-url https://rpc.testnet.lukso.network --port 8544  // using hardhat will have chainid error (default to 31337)
// 3. yarn hardhat pingpong --network fsepolia

task("pingpong").setAction(async (_taskArgs, hre) => {
  const { ethers, network } = hre;
  const abiCoder = new ethers.AbiCoder();
  let signers = await ethers.getSigners();

  let SEPOLIA_CHAIN_ID = 11155111;
  let LUKSO_CHAIN_ID = 4201;
  const HASHI_THRESHOLD = 1;

  const PING_LUKSO = "0xbD5210A110830f42e18AC6490431713bA2A61eDd";
  const PING_SEPOLIA = "0x53B79b9173Ac01E879D59523d8920212400c57C6";
  const MOCK_ADAPTER_LUKSO = "0x6f9021F5aAf61da91ce7F7D477E346d83bfdFee2";
  const MOCK_REPORTER_LUKSO = "0xeC1DD85CEff76F9C69c24C3945af624B3941aA22";
  const MOCK_ADAPTER_SEPOLIA = "0xBF06b26b409ed48e74F2d01A61675672C07aF370";
  const MOCK_REPORTER_SEPOLIA = "0x288dA9f5b01D9118AD0A1Fb998C1295fF1cf5c80";
  const YARU_SEPOLIA = "0x05B40580B851eA6c73CEd39d5c8aB91bAd7C4FF7";
  const YARU_LUKSO = "0xBd5CE0aAE635B36Eec47018aA42e1A322CE26A54";

  const PING_TOPIC =
    "0x58b69f57828e6962d216502094c54f6562f3bf082ba758966c3454f9e37b1525";
  const HASHI_MESSAGE_EXECUTED_TOPIC =
    "0xdd1bdfea38460565f157126e887f629eef09468d58dcb316e9b432eaabe1463a";
  const HASH_STORED_TOPIC =
    "0x7c57815e36323391c63e53a2fe2969599eb6dbcf52484a3bd8909aef4a6704d7";

  let pingSepolia = await ethers.getContractAt("PingPong", PING_SEPOLIA);

  let yaruSepolia = await ethers.getContractAt("IYaru", YARU_SEPOLIA);

  // Sepolia -> LUKSO testnet

  console.log("ping from Sepolia");
  let tx = await pingSepolia
    .connect(signers[0])
    .ping([MOCK_REPORTER_SEPOLIA], [MOCK_ADAPTER_LUKSO]);

  console.log("Ping tx ", tx.hash);

  let receipt = await tx.wait(1);

  let { hashiMessage, messageId, messageHash } = getRelevantDataFromEvents({
    receipt,
  });

  // await hre.changeNetwork("flukso");
  await hre.changeNetwork("lukso");

  console.log("Switching to lukso");

  //   let pingLukso = await ethers.getContractAt("PingPong", PING_LUKSO);
  //   let YaruLukso = await ethers.getContractAt("IYaru", YARU_LUKSO);
  let adapterLukso = await ethers.getContractAt(
    "MockAdapter",
    MOCK_ADAPTER_LUKSO
  );

  // Use MockYaru if using forking mode
  //   let yaruLuksoFactory = await ethers.getContractFactory("MockYaru");
  //   let yaruLukso = await yaruLuksoFactory.deploy(SEPOLIA_CHAIN_ID);
  //   await yaruLukso.deploymentTransaction().wait(1);
  // Use actual Yaru if not in forking mode
  let yaruLukso = await ethers.getContractAt("Yaru", YARU_LUKSO);
  let luksoSigners = await ethers.getSigners();
  tx = await adapterLukso
    .connect(luksoSigners[0])
    .setHashes(SEPOLIA_CHAIN_ID, [messageId], [`0x${messageHash}`]);

  receipt = await tx.wait(1);
  if (receipt.logs.find((_log) => _log.topics[0] === HASH_STORED_TOPIC)) {
    console.log("Hash Stored correctly: ", tx.hash);
  } else {
    console.log("Failed to store hash");
  }

  const decodedHashiMessage = decodeHashiMessage(hashiMessage, { abiCoder });

  tx = await yaruLukso
    .connect(luksoSigners[0])
    .executeMessages([decodedHashiMessage]);

  receipt = await tx.wait(1);

  if (
    receipt.logs.find((_log) => _log.topics[0] === HASHI_MESSAGE_EXECUTED_TOPIC)
  ) {
    console.log("Message Executed");
  } else {
    console.log("Failed to executed message");
  }

  console.log("Message executed ", tx.hash);

  if (receipt.logs.find((_log) => _log.topics[0] === PING_TOPIC)) {
    console.log("Pong!");
  } else {
    console.log("Failed to call ping!");
  }

  console.log("Sepolia -> LUKSO testnet done");

  let pingLukso = await ethers.getContractAt("PingPong", PING_LUKSO);
  console.log("ping from LUKSO testnet");
  tx = await pingLukso
    .connect(luksoSigners[0])
    .ping([MOCK_REPORTER_LUKSO], [MOCK_ADAPTER_SEPOLIA]);

  console.log("Ping tx ", tx.hash);

  receipt = await tx.wait(1);

  let {
    hashiMessage: hashiMessage2,
    messageId: messageId2,
    messageHash: messageHash2,
  } = getRelevantDataFromEvents({
    receipt,
  });

  // await hre.changeNetwork("fsepolia");
  await hre.changeNetwork("sepolia");

  console.log("Switching to Sepolia");

  //   let pingLukso = await ethers.getContractAt("PingPong", PING_LUKSO);
  //   let YaruLukso = await ethers.getContractAt("IYaru", YARU_LUKSO);
  let adapterSepolia = await ethers.getContractAt(
    "MockAdapter",
    MOCK_ADAPTER_SEPOLIA
  );

  tx = await adapterSepolia
    .connect(signers[0])
    .setHashes(LUKSO_CHAIN_ID, [messageId2], [`0x${messageHash2}`]);

  receipt = await tx.wait(1);
  if (receipt.logs.find((_log) => _log.topics[0] === HASH_STORED_TOPIC)) {
    console.log("Hash Stored correctly: ", tx.hash);
  } else {
    console.log("Failed to store hash");
  }

  const decodedHashiMessage2 = decodeHashiMessage(hashiMessage2, { abiCoder });

  // Use MockYaru if using forking mode
  //   let yaruSepoliaFactory = await ethers.getContractFactory("MockYaru");
  //   let yaruSepolia = await yaruSepoliaFactory.deploy(LUKSO_CHAIN_ID);
  //   await yaruSepolia.deploymentTransaction().wait(1);
  // Use actual Yaru if not in forking mode

  tx = await yaruSepolia
    .connect(signers[0])
    .executeMessages([decodedHashiMessage2]);

  receipt = await tx.wait(1);

  if (
    receipt.logs.find((_log) => _log.topics[0] === HASHI_MESSAGE_EXECUTED_TOPIC)
  ) {
    console.log("Message Executed");
  } else {
    console.log("Failed to executed message");
  }

  console.log("Message executed ", tx.hash);

  if (receipt.logs.find((_log) => _log.topics[0] === PING_TOPIC)) {
    console.log("Pong!");
  } else {
    console.log("Failed to call ping!");
  }
});
