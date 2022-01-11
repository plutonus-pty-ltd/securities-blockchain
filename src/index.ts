import { Blockchain } from "./struct/Blockchain";
import { BlockGenerator } from "./struct/BlockGenerator";
import type { BlockEntry } from "./struct/BlockGenerator";
import { validateBlock } from "./lib/validator";

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
BlockchainInstance.generateEntry(TestBlock2);

console.log(BlockchainInstance.BlockchainCache);

for(let i = 0; i < BlockchainInstance.BlockchainCache.length; i++) {
	console.log(`\nBlock: ${BlockchainInstance.BlockchainCache[i].hash}`)
	console.log(validateBlock(BlockchainInstance.BlockchainCache[i]));
}


import Express from "express";
const app = Express();

app.get("/", (req, res) => res.json(BlockchainInstance.BlockchainCache));

app.listen(8099, () => console.log(`\nCache accessible at 0.0.0.0:8099`));
