import { Blockchain } from "./struct/Blockchain";
import { BlockGenerator } from "./struct/BlockGenerator";
import type { BlockEntry } from "./struct/BlockGenerator";
import { validateBlock } from "./lib/validator";
import * as WebServer from "./logic/webservice";

const BlockchainInstance = new Blockchain();


BlockchainInstance.on("ready", () => {
	/*
	const ExampleBlock = new BlockGenerator({
		data: {
			opCode: "MINT",
			assetHash: "GENERATE_NEW",
			sender: "0x0",
			recipient: "0x0"
		}
	});

	BlockchainInstance.generateEntry(ExampleBlock);
	*/

	//console.log(BlockchainInstance.BlockchainCache); // Full blockchain

	for(let i = 0; i < BlockchainInstance.BlockchainCache.length; i++) {
		console.log(`Validating Block "${BlockchainInstance.BlockchainCache[i].hash}"...`);
		console.log(validateBlock(BlockchainInstance.BlockchainCache[i])); // TODO: Start a vote between ledgers to remove or fix
	}

	WebServer.start({ port: 8099, originNode: true });
});
