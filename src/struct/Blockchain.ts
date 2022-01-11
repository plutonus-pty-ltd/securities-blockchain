import fs from "fs";
import path from "path";
import Crypto from "crypto";
import { BlockGenerator, isBlockEntry } from "./BlockGenerator";
import type { BlockEntry } from "./BlockGenerator";

const keyPair = {
	public: fs.readFileSync(path.join(__dirname, "../keys/publickey.pem")),
	private: fs.readFileSync(path.join(__dirname, "../keys/privatekey.pem"))
}

declare type IBlockchain = {
	BlockchainCache: BlockEntry[];
	obtainLatestBlock: () => BlockEntry;
	generateEntry: (blockData: BlockEntry) => BlockEntry | boolean;
	validate: () => boolean | undefined;
}

export class Blockchain implements IBlockchain {
	public readonly BlockchainCache: BlockEntry[] = [];

	constructor() {
		const genesisBlock = new BlockGenerator({ data: keyPair.public.toString() || "Genesis Block" }, false);
		if(!isBlockEntry(genesisBlock) || typeof genesisBlock === "boolean") throw new Error("Failed to initialize genesis block!");
		this.BlockchainCache = [
			this.generateEntry(genesisBlock)
		];
	}

	obtainLatestBlock(): BlockEntry {
		return this.BlockchainCache[this.BlockchainCache.length - 1];
	}

	generateEntry(blockData: BlockEntry) {
		const previousBlock = this.obtainLatestBlock();
		if(blockData.meta.nonce === previousBlock?.meta.nonce) {
			console.log(`Duplicate BlockEntry detected - nonce "${blockData.meta.nonce}"`);
			return blockData;
		}
		blockData.previousHash = previousBlock?.hash || null;
		blockData.hash = blockData.computeHash().digest("hex");
		this.BlockchainCache.push(blockData);
		return blockData;
	}

	// TODO: move this method to ../lib/validator.js
	validate() {
		console.log("\nChecking block validity...");
		for(let i = 0; i < this.BlockchainCache.length; i++) {
			const currentBlock = this.BlockchainCache[i];
			const previousBlock = this.BlockchainCache[i - 1] || null;

			if(currentBlock.hash !== currentBlock.computeHash().digest("hex") && currentBlock.hash !== null) {
				console.log(`\n! MISMATCH ! - Computed hash does not match stored hash.\nComputed: ${currentBlock.computeHash().digest("hex")}\nStored: ${currentBlock.hash}`);
				return false;
			}

			if(currentBlock.previousHash !== previousBlock?.hash && currentBlock.previousHash !== null) {
				console.log(`\n! MISMATCH ! - Stored previous hash does not match previous block's stored hash.\nCurrentBlock Stored PreviousHash: ${currentBlock.previousHash}\nPreviousBlock Stored CurrentHash: ${previousBlock?.hash}`);
				return false;
			}

			console.log(`Validated block ${currentBlock.hash}`);
		}
		return true
	}
}
