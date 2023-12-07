const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require('ethereum-cryptography/secp256k1')

app.use(cors());
app.use(express.json());

const pubkey1 = "03a61f692db2c22af90bb90ae3b0400ecd3e561df81fd903190445d529a920a510";
const pubKey2 = "031cf0d261c52209efb01af99af5b6a21bd7d331e06a3b59be495f876919cca593"
const pubKey3 = "02cf7b073ffae1a537102aa19501f23b8d1e52081c98142cea1bdf3fd26755ff9a"


const balances = {
	[pubkey1]: 100,
	[pubKey2]: 50,
	[pubKey3]: 75,
};

const transactionHashes = [];

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", (req, res) => {
	const { sender, recipient, amount, signature, hash } = req.body;

	signature['r'] = BigInt(signature['r'])
	signature['s'] = BigInt(signature['s'])

	const isSigned = secp256k1.verify(signature, hash, sender)

	if (!isSigned || transactionHashes.includes(hash)) {
		return res.status(400).send({ message: "Invalid signature" })
	}

	/* prevent replay */
	transactionHashes.push(hash);

	setInitialBalance(sender);
	setInitialBalance(recipient);

	if (balances[sender] < amount) {
		return res.status(400).send({ message: "Not enough funds!" });
	} else {
		balances[sender] -= amount;
		balances[recipient] += amount;
		return res.send({ balance: balances[sender] });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}

module.exports = app
