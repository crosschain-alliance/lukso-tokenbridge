const append0ToBytes = (a, b) => {
  const sizeToAppend = b * 2 - a.length;
  const result = "0".repeat(sizeToAppend) + a;

  return result;
};

const strip0x = (_input) => _input.replace(/^0x/, "");
module.exports.strip0x = strip0x;

const addressToBytes32 = (_addr) => {
  const addrBytes32 = "0x" + "0".repeat(24) + strip0x(_addr.toString());

  return addrBytes32.toLowerCase();
};

module.exports.addressToBytes32 = addressToBytes32;

const getHyperlaneMessage = ({
  nonce,
  originDomain,
  sender,
  destinationDomain,
  recipient,
  message,
}) => {
  const VERSION = "0x03";
  const NONCE = append0ToBytes(nonce.toString(16), 4);
  const ORIGIN_DOMAIN = append0ToBytes(originDomain.toString(16), 4);
  const SENDER = append0ToBytes(strip0x(sender.toString()), 32);
  const DEST_DOMAIN = append0ToBytes(destinationDomain.toString(16), 4);
  const RECIPIENT = append0ToBytes(strip0x(recipient.toString()), 32);
  const MESSAGE = strip0x(message);

  return (
    VERSION +
    NONCE +
    ORIGIN_DOMAIN +
    SENDER +
    DEST_DOMAIN +
    RECIPIENT +
    MESSAGE
  ).toLowerCase();
};

module.exports.getHyperlaneMessage = getHyperlaneMessage;

const getHashiMessage = ({
  nonce,
  targetChainId,
  threshold,
  sender,
  receiver,
  data,
  reporters,
  adapters,
}) => {
  const message = {
    nonce,
    targetChainId,
    threshold,
    sender,
    receiver,
  };
};
module.exports.getHashiMessage = getHashiMessage;

function zeroPadHex(value, length) {
  const hexValue = value.startsWith("0x") ? value.slice(2) : value;
  const paddedHex =
    "0x" + "0".repeat(Math.max(0, length - hexValue.length)) + hexValue;
  return paddedHex;
}

module.exports.zeroPadHex = zeroPadHex;
