import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import Crypto from "crypto";
import { BlockGenerator, isBlockEntry } from "./BlockGenerator";
import type { BlockEntry } from "./BlockGenerator";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const keyPair = {
	public: fs.readFileSync(path.join(__dirname, "../keys/publickey.pem")),
	private: fs.readFileSync(path.join(__dirname, "../keys/privatekey.pem"))
}

declare type IBlockchain = {
	BlockchainCache: BlockEntry[];
	obtainLatestBlock: () => BlockEntry;
	generateEntry: (blockData: BlockEntry) => Promise<BlockEntry | boolean>;
	validate: () => boolean | undefined;
}

export class Blockchain extends EventEmitter implements IBlockchain {
	public BlockchainCache: BlockEntry[] = [];

	constructor() {
		super();

		(async () => {
			const genesisBlock = await prisma.block.findFirst();
			if(!genesisBlock) {
				const newGenesisBlock = await this.generateEntry(new BlockGenerator({ data: keyPair.public.toString() || "Genesis Block" }, false));
				
				if(!isBlockEntry(newGenesisBlock) || typeof newGenesisBlock === "boolean") throw new Error("Failed to initialize genesis block!");
				this.BlockchainCache = [
					newGenesisBlock
				];

				this.emit("ready");
			} else {
				const fullChain = await prisma.block.findMany();

				// TODO: make this.BlockchainCache an actual cache instead of storing everthing. bad bad bad
				this.BlockchainCache = fullChain.map(block => {
					const meta = JSON.parse(block.meta);
					return {
						hash: block.hash,
						previousHash: block.previousHash,
						data: block.data,
						meta: {
							encrypted: meta.encrypted,
							nonce: meta.nonce,
							invalid: meta.invalid,
							timestamp: parseInt(meta.timestamp),
							signature: meta.signature
						},
						computeHash: () => {
							return Crypto.createHash("sha256").update(`${block.previousHash}${meta.nonce}${meta.timestamp}${block.data}`);
						}
					}
				});

				this.emit("ready");
			}
		})();
	}

	async obtainBlockByHash(hash: string): Promise<BlockEntry | null> {
		const block = await prisma.block.findUnique({
			where: { hash }
		});
		if(!block) return null;
		const meta = JSON.parse(block.meta);
		return {
			hash: block.hash,
			previousHash: block.previousHash,
			data: block.data.toString(),
			meta: {
				encrypted: meta.encrypted,
				nonce: meta.nonce,
				invalid: meta.invalid,
				timestamp: meta.timestamp,
				signature: meta.signature
			},
			computeHash: () => {
				return Crypto.createHash("sha256").update(`${block.previousHash}${meta.nonce}${meta.timestamp}${block.data}`);
			}
		}
	}

	obtainLatestBlock(): BlockEntry {
		return this.BlockchainCache[this.BlockchainCache.length - 1];
	}

	async generateEntry(blockData: BlockEntry): Promise<BlockEntry | boolean> {
		const previousBlock = this.obtainLatestBlock();
		if(blockData.meta.nonce === previousBlock?.meta.nonce) {
			console.log(`Duplicate BlockEntry detected - nonce "${blockData.meta.nonce}"`);
			blockData.meta.invalid = true;
			return blockData;
		}
		blockData.previousHash = previousBlock?.hash || null;
		blockData.hash = blockData.computeHash().digest("hex");
		await prisma.block.create({
			data: {
				hash: blockData.hash,
				previousHash: blockData.previousHash || "",
				data: JSON.stringify(blockData.data),
				meta: JSON.stringify(blockData.meta),
				timestamp: blockData.meta.timestamp.toString()
			}
		});
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
