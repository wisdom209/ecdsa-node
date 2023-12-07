import { secp256k1 } from "ethereum-cryptography/secp256k1.js"
import { toHex } from "ethereum-cryptography/utils.js"

const privateKey = secp256k1.utils.randomPrivateKey()
const publicKey = secp256k1.getPublicKey(privateKey);
console.log("private: ", toHex(privateKey));
console.log("public: ", toHex(publicKey));
