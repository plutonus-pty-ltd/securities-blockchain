import { Blockchain } from "./struct/Blockchain";
import { BlockGenerator, BlockEntry } from "./struct/BlockGenerator";

const BlockchainInstance = new Blockchain();

const TestBlock = new BlockGenerator({
	data: {
		opCode: "MINT",
		assetHash: "GENERATE_NEW",
		sender: "0x0",
		recipient: "0x0"
	}
});

const TestBlock2 = new BlockGenerator({
	data: {
		opCode: "BURN",
		assetHash: "NULL",
		sender: "0x0",
		recipient: "0x0"
	}
});

BlockchainInstance.generateEntry(TestBlock);
BlockchainInstance.generateEntry(TestBlock); // handle duplicate entries
BlockchainInstance.generateEntry(TestBlock2);

console.log(BlockchainInstance.BlockchainCache);
console.log(`\nChain Validity: ${BlockchainInstance.validate() === true ? "VALID" : "MISMATCH"}`);

import Express from "express";
const app = Express();

app.get("/", (req, res) => res.json(BlockchainInstance.BlockchainCache));

app.listen(8010);
