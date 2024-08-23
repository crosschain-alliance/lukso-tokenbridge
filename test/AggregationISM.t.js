const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { getHyperlaneMessage, addressToBytes32 } = require("./utils");

describe("Aggregation ISM should work", function () {
  const SOURCE_CHAIN_ID = 100;
  const DESTINATION_CHAIN_ID = 200;
  const HYP_NONCE = 0; // nonce from Hyperlane message
  const hashiHookAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const mockMessage = "0x12345678";
  const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
  const HASHI_THRESHOLD = 2;
  const ISM_THRESHOLD = 2;

  async function deployFixture() {
    const [owner, fakeReporter1, fakeReporter2, fakeAdapter1, fakeAdapter2] =
      await ethers.getSigners();

    const hashiManagerFactory = await ethers.getContractFactory("HashiManager");
    const hashiManager = await hashiManagerFactory.deploy();
    const mailboxFactory = await ethers.getContractFactory("Mailbox");
    const mailbox = await mailboxFactory.deploy(DESTINATION_CHAIN_ID);
    const yaruFactory = await ethers.getContractFactory("MockYaru");
    const yaru = await yaruFactory.deploy(SOURCE_CHAIN_ID);
    const hashiISMFactory = await ethers.getContractFactory("HashiISM");
    const hashiISM = await hashiISMFactory.deploy(
      await hashiManager.getAddress()
    );
    const mockISMFactory = await ethers.getContractFactory("MockISM");
    const mockISM = await mockISMFactory.deploy();
    const aggregationISMFactory =
      await ethers.getContractFactory("AggregationISM");
    const aggregationISM = await aggregationISMFactory.deploy();
    const mockHookFactory = await ethers.getContractFactory("MockHook");
    const mockHook = await mockHookFactory.deploy();
    const mockRecipientFactory =
      await ethers.getContractFactory("MockRecipient");
    const mockRecipient = await mockRecipientFactory.deploy();

    const hyperlaneMessage = getHyperlaneMessage({
      nonce: HYP_NONCE,
      originDomain: SOURCE_CHAIN_ID,
      sender: owner.address,
      destinationDomain: DESTINATION_CHAIN_ID,
      recipient: (await mockRecipient.getAddress()).toString(), // recipient on the destination chain must be a contract
      message: mockMessage,
    });

    const hashiMessage = {
      nonce: 0,
      targetChainId: DESTINATION_CHAIN_ID,
      threshold: HASHI_THRESHOLD,
      sender: hashiHookAddr, // sender is the HashiHook
      receiver: await hashiISM.getAddress(),
      data: hyperlaneMessage,
      reporters: [fakeReporter1.address, fakeReporter2.address],
      adapters: [fakeAdapter1.address, fakeAdapter2.address],
    };

    return {
      hashiManager,
      mailbox,
      yaru,
      hashiISM,
      owner,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      hashiMessage,
      mockISM,
      mockHook,
      hyperlaneMessage,
      mockRecipient,
      aggregationISM,
    };
  }

  it("Should initialize Aggregation ISM", async function () {
    const { mockISM, hashiISM, aggregationISM } =
      await loadFixture(deployFixture);

    const returnObject = await aggregationISM.modulesAndThreshold(mockMessage);
    expect(returnObject[0][0]).to.eq(ZERO_ADDR);
    expect(returnObject[0][1]).to.eq(ZERO_ADDR);
    expect(returnObject[1]).to.eq(0n);

    await aggregationISM.setRequiredModulesAndThreshold(
      [await hashiISM.getAddress(), await mockISM.getAddress()],
      ISM_THRESHOLD
    );

    expect(await aggregationISM.hashiISM()).to.eq(await hashiISM.getAddress());
    expect(await aggregationISM.multisigISM()).to.eq(
      await mockISM.getAddress()
    );
    expect(await aggregationISM.threshold()).to.eq(ISM_THRESHOLD);

    expect(
      await aggregationISM.setRequiredModulesAndThreshold(
        [await hashiISM.getAddress(), await mockISM.getAddress()],
        ISM_THRESHOLD + 1
      )
    ).to.revertedWith("invalid threshold");

    // expect(
    //     await aggregationISM.setRequiredModulesAndThreshold(
    //       [await hashiISM.getAddress()],
    //       ISM_THRESHOLD
    //     )
    //   ).to.revertedWith("invalid ISM array");
  });

  it("Should execute correctly", async function () {
    const {
      hashiManager,
      mailbox,
      yaru,
      hashiISM,
      owner,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      hashiMessage,
      mockHook,
      hyperlaneMessage,
      mockRecipient,
      aggregationISM,
      mockISM,
    } = await loadFixture(deployFixture);

    await mailbox.initialize(
      owner,
      await aggregationISM.getAddress(), // default ISM
      await mockHook.getAddress(), // default hook
      await mockHook.getAddress() // required hook
    );

    await aggregationISM.setRequiredModulesAndThreshold(
      [await hashiISM.getAddress(), await mockISM.getAddress()],
      ISM_THRESHOLD
    );

    await hashiManager.setReportersAdaptersAndThreshold(
      [fakeReporter1, fakeReporter2],
      [fakeAdapter1, fakeAdapter2],
      HASHI_THRESHOLD
    );
    await hashiManager.setExpectedThreshold(HASHI_THRESHOLD);
    await hashiManager.setExpectedAdaptersHash([fakeAdapter1, fakeAdapter2]);
    await hashiManager.setTargetChainId(SOURCE_CHAIN_ID);
    await hashiManager.setTargetAddress(hashiHookAddr);
    await hashiManager.setYaru(await yaru.getAddress());

    const hashMsg = ethers.solidityPackedKeccak256(
      ["bytes"],
      [hashiMessage.data]
    );

    expect(await yaru.executeMessages([hashiMessage]))
      .to.emit(hashiISM, "ApprovedByHashi")
      .withArgs(hashMsg, true);

    // TODO: fix metadata error
    // expect(await mailbox.process("0x00", hyperlaneMessage))
    //   .to.emit(mailbox, "Process")
    //   .withArgs(
    //     SOURCE_CHAIN_ID,
    //     addressToBytes32(owner.address.toString()),
    //     mockMessage
    //   )
    //   .to.emit(mailbox, "ProcessId")
    //   .withArgs(hashMsg)
    //   .to.emit(mockRecipient, "HandledByRecipient")
    //   .withArgs(
    //     SOURCE_CHAIN_ID,
    //     addressToBytes32(owner.address.toString()),
    //     mockMessage
    //   );
  });
});
