const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { addressToBytes32, strip0x, getHyperlaneMessage } = require("./utils");

describe("Dispatching Message from Source Chain", function () {
  const SOURCE_CHAIN_ID = 100;
  const DESTINATION_CHAIN_ID = 200;
  const HYP_NONCE = 0; // nonce from Hyperlane message
  const HASHI_MESSAGE_ID = 0;
  const HASHI_THRESHOLD = 2;

  const hashiISMAddr = "0x0000000000000000000000000000000000000044";
  const mockMessage = "0x12345678";

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, fakeReporter1, fakeReporter2, fakeAdapter1, fakeAdapter2] =
      await ethers.getSigners();

    const hashiManagerFactory = await ethers.getContractFactory("HashiManager");
    const hashiManager = await hashiManagerFactory.deploy();
    const mailBoxFactory = await ethers.getContractFactory("Mailbox");
    const mailBox = await mailBoxFactory.deploy(SOURCE_CHAIN_ID); // constructor args: localDomainId
    const hashiHookFactory = await ethers.getContractFactory("HashiHook");
    let hashiHook = await hashiHookFactory.deploy(
      await mailBox.getAddress(),
      await hashiManager.getAddress(),
      hashiISMAddr
    );

    const mockISMFactory = await ethers.getContractFactory("MockISM");
    const mockISM = await mockISMFactory.deploy();
    const mockHookFactory = await ethers.getContractFactory("MockHook");
    const mockHook = await mockHookFactory.deploy();
    const yahoFactory = await ethers.getContractFactory("MockYaho");
    const yaho = await yahoFactory.deploy();

    const hyperlaneMessage = getHyperlaneMessage({
      nonce: HYP_NONCE,
      originDomain: SOURCE_CHAIN_ID,
      sender: owner.address,
      destinationDomain: DESTINATION_CHAIN_ID,
      recipient: owner.address,
      message: mockMessage,
    });

    const hashiMessage = [
      0, // nonce
      DESTINATION_CHAIN_ID, // targetChainId
      HASHI_THRESHOLD,
      await hashiHook.getAddress(), // sender
      hashiISMAddr, // receiver
      hyperlaneMessage, // data
      [fakeReporter1.address, fakeReporter2.address],
      [fakeAdapter1.address, fakeAdapter2.address],
    ];

    return {
      hashiManager,
      mailBox,
      hashiHook,
      mockISM,
      mockHook,
      yaho,
      owner,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      hyperlaneMessage,
      hashiMessage,
    };
  }

  it("Should Dispatch Message correctly", async function () {
    const {
      hashiManager,
      mailBox,
      hashiHook,
      mockISM,
      mockHook,
      owner,
      yaho,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      hyperlaneMessage,
      hashiMessage,
    } = await loadFixture(deployFixture);

    await mailBox.initialize(
      owner,
      await mockISM.getAddress(), // default ISM
      await mockHook.getAddress(), // default Hook
      await hashiHook.getAddress() // required Hook
    );

    await hashiManager.setYaho(await yaho.getAddress());

    await hashiManager.setReportersAdaptersAndThreshold(
      [fakeReporter1, fakeReporter2],
      [fakeAdapter1, fakeAdapter2],
      HASHI_THRESHOLD
    );
    await hashiManager.setTargetChainId(DESTINATION_CHAIN_ID);
    await expect(
      await mailBox.dispatch(
        DESTINATION_CHAIN_ID, // destination domain
        addressToBytes32(owner.address), // recipient
        mockMessage
      )
    )
      .to.emit(mailBox, "Dispatch")
      .withArgs(
        owner.address,
        DESTINATION_CHAIN_ID,
        addressToBytes32(owner.address),
        hyperlaneMessage
      )
      .to.emit(yaho, "MessageDispatched")
      .withArgs(HASHI_MESSAGE_ID, hashiMessage);
  });
});
