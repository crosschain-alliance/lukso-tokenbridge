 const concatTypedArrays = (a, b) => {
    var c = new a.constructor(a.length + b.length)
    c.set(a, 0)
    c.set(b, a.length)
    return c
  }
  module.exports.concatTypedArrays = concatTypedArrays

  const append0ToBytes = (a, b) => {


    const sizeToAppend = b*2 - a.length
    const result = "0".repeat(sizeToAppend) + a

    return result

  }

  const strip0x = (_input) => _input.replace(/^0x/, "")
  module.exports.strip0x = strip0x
  
  const signatureToVrs= (_rawSignature) => {
    const signature = strip0x(_rawSignature)
    const v = signature.substr(64 * 2)
    const r = signature.substr(0, 32 * 2)
    const s = signature.substr(32 * 2, 32 * 2)
    return { v, r, s }
  }

  module.exports.signatureToVrs = signatureToVrs
  
  const packSignatures  = (_signatures) => {
    const length = Number(_signatures.length).toString(16)
    const msgLength = length.length === 1 ? `0${length}` : length
    let v = ""
    let r = ""
    let s = ""
    _signatures.forEach((e) => {
      v = v.concat(e.v)
      r = r.concat(e.r)
      s = s.concat(e.s)
    })
    return `0x${msgLength}${v}${r}${s}`
  }

  module.exports.packSignatures = packSignatures
  
  const append0 = (_arr) => {
    const a = new Uint8Array(1)
    a[0] = 0
    return concatTypedArrays(a, _arr)
  }

  module.exports.append0 = append0

  const addressToBytes32 = (_addr) => {

    const addrBytes32 = '0x' + '0'.repeat(24) + strip0x(_addr.toString())

    return addrBytes32.toLowerCase()
  }

module.exports.addressToBytes32 = addressToBytes32


 

const MESSAGE_DISPATCHED_TOPIC = "0x218247aabc759e65b5bb92ccc074f9d62cd187259f2a0984c3c9cf91f67ff7cf"

 const decodeHashiMessage = (_message, { abiCoder }) => {
  const [[nonce, targetChainId, threshold, sender, receiver, data, reporters, adapters]] = abiCoder.decode(
    ["(uint256,uint256,uint256,address,address,bytes,address[],address[])"],
    _message,
  )

  return [
    nonce,
    targetChainId,
    threshold,
    sender,
    receiver,
    data,
    reporters.map((_reporter) => _reporter),
    adapters.map((_adapter) => _adapter),
  ]
}

module.exports.decodeHashiMessage = decodeHashiMessage

 const getRelevantDataFromEvents = ({
  receipt,
  abiCoder,
  topic,
  onlyHashiMessage = false,
  bridge = "amb",
  ethers,
}) => {
  const { data: hashiMessage } = receipt.logs.find((_log) => _log.topics[0] === MESSAGE_DISPATCHED_TOPIC)

  if (bridge === "amb") {
    if (onlyHashiMessage) {
      return {
        hashiMessage,
      }
    }

    const { data: message } = receipt.logs.find((_log) => _log.topics[0] === topic)
    const [decodedMessage] = abiCoder.decode(["bytes"], message)
    const messageId = ethers.solidityPackedKeccak256(["bytes"], [decodedMessage])

    return {
      decodedMessage,
      hashiMessage,
      message,
      messageId,
    }
  }
  if (bridge === "xdai") {
    const log = receipt.logs.find((_log) => _log.topics[0] === topic)

    if (
      topic === "0xf6968e689b3d8c24f22c10c2a3256bb5ca483a474e11bac08423baa049e38ae8" ||
      topic === "0xbcb4ebd89690a7455d6ec096a6bfc4a8a891ac741ffe4e678ea2614853248658"
    ) {
      return {
        message: log.data,
        messageArgs: log.args,
        hashiMessage,
      }
    }

    return {
      message: log.data,
      hashiMessage,
    }
  }
}

module.exports.getRelevantDataFromEvents = getRelevantDataFromEvents

 const getValidatorsSignatures = ({ validators, message, bridge = "amb" }) =>
  Promise.all(
    validators.map((_validator) =>
      _validator.signMessage(bridge === "amb" ? append0(ethers.toBeArray(message)) : ethers.toBeArray(message)),
    ),
  )

  module.exports.getValidatorsSignatures = getValidatorsSignatures

  const getHyperlaneMessage = ({nonce, originDomain, sender, destinationDomain, recipient, message}) =>{

    const VERSION = "0x03";
    const NONCE = append0ToBytes(nonce.toString(16),4) 
    const ORIGIN_DOMAIN = append0ToBytes(originDomain.toString(16),4)
    const SENDER = append0ToBytes(strip0x(sender.toString()), 32)
    const DEST_DOMAIN = append0ToBytes(destinationDomain.toString(16), 4)
    const RECIPIENT = append0ToBytes(strip0x(recipient.toString()), 32)
    const MESSAGE = strip0x(message)

    return (VERSION + NONCE + ORIGIN_DOMAIN + SENDER + DEST_DOMAIN + RECIPIENT + MESSAGE).toLowerCase()
  }

  module.exports.getHyperlaneMessage = getHyperlaneMessage

  const getHashiMessage = ({nonce, targetChainId, threshold, sender, receiver, data, reporters, adapters}) => {

    const message = {
      nonce,
      targetChainId,
      threshold,
      sender,
      receiver, 

    }
  }
  module.exports.getHashiMessage = getHashiMessage

  const getHashMessage = () => {

  }