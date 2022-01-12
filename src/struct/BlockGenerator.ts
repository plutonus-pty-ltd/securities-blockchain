require("dotenv").config();
import fs from "fs";
import path from "path";
import * as Crypto from "crypto";

const keyPair = {
	public: fs.readFileSync(path.join(__dirname, "../keys/publickey.pem")).toString("ascii"),
	private: fs.readFileSync(path.join(__dirname, "../keys/privatekey.pem")).toString("ascii")
}

export type BlockData = {
	opCode: string;
	assetHash: string;
	sender: string;
	recipient: string;
}

export type BlockEntry = {
	hash: string;
	previousHash: string | null;
	data: BlockData | string;
	meta: {
		encrypted: boolean;
		nonce: string;
		invalid?: boolean;
		timestamp: number;
		signature: string | null;
	}
	computeHash: () => Crypto.Hash;
}

export const isBlockEntry = (data: any): data is BlockEntry => !data?.invalid;

export class BlockGenerator implements BlockEntry {
	public hash: string;
	public previousHash: string | null;
	public data: string | {
		opCode: string;
		assetHash: string;
		sender: string;
		recipient: string;
	};
	public meta: {
		encrypted: boolean;
		nonce: string;
		invalid: boolean;
		timestamp: number;
		signature: string | null;
	};

	constructor({ previousHash, data }: { previousHash?: string | null, data: string | BlockData }, encrypt: boolean = true) {
		if(!data) throw new Error("Data not provided.");

		this.meta = {
			encrypted: encrypt,
			nonce: Crypto.randomBytes(16).toString("hex").slice(0, 32),
			invalid: false,
			timestamp: Date.now(),
			signature: null
		};
		this.hash = this.computeHash().digest("hex");

		let tempData;
		this.data = JSON.stringify(data.toString()).replace(/["]+/g, "");
		if(encrypt) tempData = Crypto.publicEncrypt(
			{
				key: keyPair.public,
				padding: Crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: "sha256"
			},
			Buffer.from(this.data.toString())
		);
		const signature = Crypto.createSign("RSA-SHA256").update(tempData || this.data).sign({
			key: keyPair.private,
			passphrase: process.env.SECRETKEY_PASSPHRASE
		}, "base64");

		this.meta.signature = signature || null;

		if(encrypt) this.data = tempData?.toString("base64") || Buffer.from(data.toString(), "ascii").toString("base64");
		this.previousHash = previousHash || null;
		this.hash = this.computeHash().digest("hex");

		return this;
	}

	computeHash(): Crypto.Hash {
		return Crypto.createHash("sha256").update(`${this.previousHash}${this.meta.nonce}${this.meta.timestamp}${typeof this.data === "string" ? this.data : JSON.stringify(this.data)}`);
	}	
}
