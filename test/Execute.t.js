const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const {
  getHyperlaneMessage,
  addressToBytes32,
  zeroPadHex,
} = require("./utils");

describe("Execute Message", function () {
  const SOURCE_CHAIN_ID = 100;
  const DESTINATION_CHAIN_ID = 200;
  const HYP_NONCE = 0; // nonce from Hyperlane message
  const hashiHookAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const mockMessage = "0x12345678";
  const HASHI_THRESHOLD = 2;
  const totalSupply = 1;

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
    const mockHookFactory = await ethers.getContractFactory("MockHook");
    const mockHook = await mockHookFactory.deploy();
    const mockRecipientFactory =
      await ethers.getContractFactory("MockRecipient");
    const mockRecipient = await mockRecipientFactory.deploy();
    const wrappedTokenFactory = await ethers.getContractFactory("MockHypERC20");
    const wrappedToken = await wrappedTokenFactory.deploy(
      18,
      await mailbox.getAddress()
    );

    const ERC20Factory = await ethers.getContractFactory("MockERC20");
    const erc20 = await ERC20Factory.deploy();
    const collateralTokenFactory = await ethers.getContractFactory(
      "MockHypERC20Collateral"
    );
    const collateralToken = await collateralTokenFactory.deploy(
      await erc20.getAddress(),
      await mailbox.getAddress() // should be source chain Mailbox
    );

    const multiCallFactory = await ethers.getContractFactory("Multicall3");
    const multiCall = await multiCallFactory.deploy();

    // initialize(
    // uint256 _totalSupply,
    // string memory _name,
    // string memory _symbol,
    // address _hook,
    // address _interchainSecurityModule,
    // address _owner)
    await wrappedToken.initialize(
      totalSupply,
      "Wrapped Token",
      "WRP",
      hashiHookAddr,
      await hashiISM.getAddress(),
      owner.address
    );
    await wrappedToken.enrollRemoteRouter(
      SOURCE_CHAIN_ID,
      zeroPadHex(await collateralToken.getAddress(), 64)
    );

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

    await mailbox.initialize(
      owner,
      await hashiISM.getAddress(), // default ISM
      await mockHook.getAddress(), // default hook
      await mockHook.getAddress() // required hook
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
      wrappedToken,
      collateralToken,
      multiCall,
    };
  }

  it("Should process token tx correctly", async function () {
    const {
      mailbox,
      yaru,
      hashiISM,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      mockRecipient,
      wrappedToken,
      collateralToken,
    } = await loadFixture(deployFixture);

    const transferAmount = 100n;
    const transferMessage = ethers.solidityPacked(
      ["bytes32", "uint256"],
      [addressToBytes32(await mockRecipient.getAddress()), transferAmount]
    );

    //  Hyperlane message for token minting
    // origin domain = source domain
    // sender = bytes32 source hypERC20 Collateral address
    // message = ethers.solidityPacked( ["bytes32", "uint256"], [bytes32 receiver, transferAmount]);

    const hyperlaneMessageForTokenRelay = getHyperlaneMessage({
      nonce: HYP_NONCE,
      originDomain: SOURCE_CHAIN_ID,
      sender: addressToBytes32(await collateralToken.getAddress()),
      destinationDomain: DESTINATION_CHAIN_ID,
      recipient: (await wrappedToken.getAddress()).toString(), // recipient on the destination chain must be a contract
      message: transferMessage,
    });

    const hashiMessageForTokenRelay = {
      nonce: 0,
      targetChainId: DESTINATION_CHAIN_ID,
      threshold: HASHI_THRESHOLD,
      sender: hashiHookAddr, // sender is the HashiHook
      receiver: await hashiISM.getAddress(),
      data: hyperlaneMessageForTokenRelay,
      reporters: [fakeReporter1.address, fakeReporter2.address],
      adapters: [fakeAdapter1.address, fakeAdapter2.address],
    };

    const hashMsg = ethers.solidityPackedKeccak256(
      ["bytes"],
      [hashiMessageForTokenRelay.data]
    );

    expect(await yaru.executeMessages([hashiMessageForTokenRelay]))
      .to.emit(hashiISM, "ApprovedByHashi")
      .withArgs(hashMsg, true);

    expect(await mailbox.process("0x00", hyperlaneMessageForTokenRelay))
      .to.emit(mailbox, "Process")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(await collateralToken.getAddress()),
        transferMessage
      )
      .to.emit(mailbox, "ProcessId")
      .withArgs(hashMsg)
      .to.emit(wrappedToken, "Transfer")
      .withArgs(
        "0x0000000000000000000000000000000000000000",
        addressToBytes32(await mockRecipient.getAddress()),
        transferAmount
      )
      .to.emit(wrappedToken, "ReceivedTransferRemote")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(await mockRecipient.getAddress()),
        transferAmount
      );

    expect(
      await wrappedToken.balanceOf(await mockRecipient.getAddress())
    ).to.equal(transferAmount);
  });

  it("Should process batching correctly", async function () {
    const {
      mailbox,
      yaru,
      hashiISM,
      fakeReporter1,
      fakeReporter2,
      fakeAdapter1,
      fakeAdapter2,
      mockRecipient,
      wrappedToken,
      collateralToken,
      multiCall,
    } = await loadFixture(deployFixture);

    const transferAmount = 100n;
    const transferMessage = ethers.solidityPacked(
      ["bytes32", "uint256"],
      [addressToBytes32(await mockRecipient.getAddress()), transferAmount]
    );

    let multiCallArr = [];
    let hashiMessageArr = [];
    const count = 15;
    const ABI = [
      "function process(bytes calldata _metadata,bytes calldata _message)external payable",
    ];

    const iface = new ethers.Interface(ABI);

    // construct batching input array for Hashi & Hyperlane
    for (let i = 0; i < count; i++) {
      let hyperlaneMessageForTokenRelay = getHyperlaneMessage({
        nonce: i,
        originDomain: SOURCE_CHAIN_ID,
        sender: addressToBytes32(await collateralToken.getAddress()),
        destinationDomain: DESTINATION_CHAIN_ID,
        recipient: (await wrappedToken.getAddress()).toString(), // recipient on the destination chain must be a contract
        message: transferMessage,
      });

      let hashiMessage = {
        nonce: i,
        targetChainId: DESTINATION_CHAIN_ID,
        threshold: HASHI_THRESHOLD,
        sender: hashiHookAddr, // sender is the HashiHook
        receiver: await hashiISM.getAddress(),
        data: hyperlaneMessageForTokenRelay,
        reporters: [fakeReporter1.address, fakeReporter2.address],
        adapters: [fakeAdapter1.address, fakeAdapter2.address],
      };
      hashiMessageArr.push(hashiMessage);

      let calldata = iface.encodeFunctionData("process", [
        "0x00", //metadata
        hyperlaneMessageForTokenRelay,
      ]);

      // MultiCall3 Call3 struct
      let call3 = {
        target: await mailbox.getAddress(),
        allowFailure: false,
        callData: calldata,
      };
      multiCallArr.push(call3);
    }

    expect(await yaru.executeMessages(hashiMessageArr)).to.emit(
      hashiISM,
      "ApprovedByHashi"
    );

    expect(await multiCall.aggregate(multiCallArr))
      .to.emit(mailbox, "Process")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(await collateralToken.getAddress()),
        transferMessage
      )
      .to.emit(mailbox, "ProcessId")
      .to.emit(wrappedToken, "Transfer")
      .withArgs(
        "0x0000000000000000000000000000000000000000",
        addressToBytes32(await mockRecipient.getAddress()),
        transferAmount
      )
      .to.emit(wrappedToken, "ReceivedTransferRemote")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(await mockRecipient.getAddress()),
        transferAmount
      );

    expect(
      await wrappedToken.balanceOf(await mockRecipient.getAddress())
    ).to.equal(transferAmount * BigInt(count));
  });

  it("Should process normal message correctly", async function () {
    const {
      mailbox,
      yaru,
      hashiISM,
      owner,
      hashiMessage,
      hyperlaneMessage,
      mockRecipient,
    } = await loadFixture(deployFixture);

    const hashMsg = ethers.solidityPackedKeccak256(
      ["bytes"],
      [hashiMessage.data]
    );

    expect(await yaru.executeMessages([hashiMessage]))
      .to.emit(hashiISM, "ApprovedByHashi")
      .withArgs(hashMsg, true);

    expect(await mailbox.process("0x00", hyperlaneMessage))
      .to.emit(mailbox, "Process")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(owner.address.toString()),
        mockMessage
      )
      .to.emit(mailbox, "ProcessId")
      .withArgs(hashMsg)
      .to.emit(mockRecipient, "HandledByRecipient")
      .withArgs(
        SOURCE_CHAIN_ID,
        addressToBytes32(owner.address.toString()),
        mockMessage
      );
  });
});
