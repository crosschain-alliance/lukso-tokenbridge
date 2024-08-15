const HYP_DISPATCH_TOPIC =
  "0x769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c814";

// From Yaho
const HASHI_MESSAGE_DISPATCH_TOPIC =
  "0x218247aabc759e65b5bb92ccc074f9d62cd187259f2a0984c3c9cf91f67ff7cf";

const HASHI_REPORTER_MESSAGE_DISPATCH_TOPIC =
  "0xd05d8e0013365e4d441d98e6459477af9dd142c5cf590e87ca927921993b6c62";

const HYP_PROCESS_TOPIC =
  "0x0d381c2a574ae8f04e213db7cfb4df8df712cdbd427d9868ffef380660ca6574";

const APPROVED_BY_HASHI_TOPIC =
  "0x8c7b96e8dca0881faaf4541d70bbcb326c89cd39dda2758b09c199c098b0bb40";

const getMessageFromDispatch = ({ receipt }) => {
  receipt.logs.find((log) => {
    if (log.topics[0] === HYP_DISPATCH_TOPIC)
      console.log(
        `Dispatch message from sender: ${log.topics[1]}, destination: ${log.topics[2]}, recipient: ${log.topics[3]}, data: ${log.data}`
      );
  });
};

module.exports.getMessageFromDispatch = getMessageFromDispatch;

const getMessageFromYaru = ({ receipt }) => {
  receipt.logs.find((log) => {
    if (log.topics[0] === APPROVED_BY_HASHI_TOPIC)
      console.log(`Hash message ${log.topics[1]} is approved ${log.topics[2]}`);
  });
};
module.exports.getMessageFromYaru = getMessageFromYaru;

const getMessageFromProcess = ({ receipt }) => {
  receipt.logs.find((log) => {
    if (log.topics[0] === HYP_PROCESS_TOPIC) {
      console.log(
        `Process data: origin ${log.topics[1]}, sender ${log.topics[2]}, recipient ${log.topics[3]}`
      );
    }
  });
};

module.exports.getMessageFromProcess = getMessageFromProcess;

module.exports.getRelevantDataFromEvents = ({ receipt }) => {
  const yahoReceipt = receipt.logs.find(
    (_log) => _log.topics[0] === HASHI_MESSAGE_DISPATCH_TOPIC
  );

  const hashiMessage = yahoReceipt.data;
  const messageId = yahoReceipt.topics[1];

  const reporterReceipt = receipt.logs.find(
    (_log) =>
      _log.topics[0] === HASHI_REPORTER_MESSAGE_DISPATCH_TOPIC &&
      _log.topics[2] === messageId
  );

  const messageHash = reporterReceipt.data.slice(-64);

  return {
    hashiMessage,
    messageId,
    messageHash,
  };
};

module.exports.decodeHashiMessage = (_message, { abiCoder }) => {
  const [
    [
      nonce,
      targetChainId,
      threshold,
      sender,
      receiver,
      data,
      reporters,
      adapters,
    ],
  ] = abiCoder.decode(
    ["(uint256,uint256,uint256,address,address,bytes,address[],address[])"],
    _message
  );

  return [
    nonce,
    targetChainId,
    threshold,
    sender,
    receiver,
    data,
    reporters.map((_reporter) => _reporter),
    adapters.map((_adapter) => _adapter),
  ];
};
