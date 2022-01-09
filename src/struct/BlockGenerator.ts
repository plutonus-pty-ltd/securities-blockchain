import * as Crypto from "crypto";

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
		nonce: string;
		invalid?: boolean;
		timestamp: number
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
		nonce: string;
		invalid: boolean;
		timestamp: number;
	};

	constructor({ previousHash, data }: { previousHash?: string | null, data: string | BlockData }) {
		if(!data) throw new Error("Data not provided.");

		this.meta = {
			nonce: Crypto.randomBytes(16).toString("hex").slice(0, 32),
			invalid: false,
			timestamp: Date.now()
		};
		this.hash = this.computeHash().digest("hex");

		this.data = data;
		this.previousHash = previousHash || null;
		this.hash = this.computeHash().digest("hex");

		return this;
	}

	computeHash(): Crypto.Hash {
		return Crypto.createHash("sha256").update(`${this.previousHash}${this.meta.nonce}${this.meta.timestamp}${typeof this.data === "string" ? this.data : JSON.stringify(this.data)}`);
	}	
}
