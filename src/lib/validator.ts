import fs from "fs";
import path from "path";
import Crypto from "crypto";
import type { BlockEntry } from "../struct/BlockGenerator";

const keyPair = {
	public: fs.readFileSync(path.join(__dirname, "../keys/publickey.pem")).toString("ascii"),
	private: fs.readFileSync(path.join(__dirname, "../keys/privatekey.pem")).toString("ascii")
}

// TODO: Promisify this so that it can be done in chunks
export function validateBlock(blockData: BlockEntry): { valid: boolean, error?: string } {
	if(!blockData.meta.signature) return { valid: false, error: "signature:missing" }
	if(!blockData.meta.timestamp) return { valid: false, error: "timestamp:missing" }
	if(!blockData.meta.nonce) return { valid: false, error: "nonce:missing" }

	if(!blockData.hash) return { valid: false, error: "hash:missing" }
	if(!blockData.previousHash && String.raw({raw:blockData.data.toString()}) != JSON.stringify(keyPair.public.toString()).replace(/["]+/g, "")) return { valid: false, error: "previousHash:missing" } // edge case: genesis block
	if(!blockData.data) return { valid: false, error: "data:missing" }

	const signatureValid = Crypto.createVerify("RSA-SHA256").update(blockData.data.toString(), blockData.meta.encrypted ? "base64" : "ascii").verify(Buffer.from(keyPair.public, "ascii"), Buffer.from(blockData.meta.signature || "", "base64"));

	if(!signatureValid) return { valid: false, error: "signature:invalid" }
	return { valid: true }
}
