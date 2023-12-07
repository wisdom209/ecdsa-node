import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, bytesToHex as toHex } from "ethereum-cryptography/utils";

import { useState } from "react";
import server from "./server";

function hashMessage(message) {
	return toHex(keccak256(utf8ToBytes(message)));
}

function signMessage(hashedMsg, privateKey) {
	const signedHashedMsg = secp256k1.sign(hashedMsg, privateKey)
	return signedHashedMsg;
}


function Transfer({ address, setBalance }) {
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [privateKey, setPrivateKey] = useState("");


	const setValue = (setter) => (evt) => setter(evt.target.value);

	async function transfer(evt) {
		evt.preventDefault();

		const dataToHash = {
			time: Date.now(),
			sender: address,
			amount: parseInt(sendAmount),
			recipient,
		}

		const hashedMsg = hashMessage(JSON.stringify(dataToHash));

		let signedMessage = signMessage(hashedMsg, privateKey);
		signedMessage['r'] = signedMessage['r'].toString()
		signedMessage['s'] = signedMessage['s'].toString()

		try {
			const {
				data: { balance },
			} = await server.post(`send`, {
				sender: address,
				amount: parseInt(sendAmount),
				recipient,
				signature: signedMessage,
				hash: hashedMsg
			});
			setBalance(balance);
		} catch (ex) {
			alert(ex.response.data.message);
		}
	}

	return (
		<form className="container transfer" onSubmit={transfer}>
			<h1>Send Transaction</h1>

			<label>
				Send Amount
				<input
					placeholder="1, 2, 3..."
					value={sendAmount}
					onChange={setValue(setSendAmount)}
				></input>
			</label>

			<label>
				Recipient
				<input
					placeholder="Type an address, for example: 0x2"
					value={recipient}
					onChange={setValue(setRecipient)}
				></input>
			</label>

			<label>
				Sign with private key
				<input
					placeholder="Enter your private key"
					value={privateKey}
					onChange={setValue(setPrivateKey)}
				/>
			</label>

			<input type="submit" className="button" value="Transfer" />
		</form>
	);
}

export default Transfer;
