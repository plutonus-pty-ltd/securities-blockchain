"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Blockchain_1 = require("./struct/Blockchain");
const BlockGenerator_1 = require("./struct/BlockGenerator");
const validator_1 = require("./lib/validator");
const BlockchainInstance = new Blockchain_1.Blockchain();
const TestBlock = new BlockGenerator_1.BlockGenerator({
    data: {
        opCode: "MINT",
        assetHash: "GENERATE_NEW",
        sender: "0x0",
        recipient: "0x0"
    }
});
const TestBlock2 = new BlockGenerator_1.BlockGenerator({
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
for (let i = 0; i < BlockchainInstance.BlockchainCache.length; i++) {
    console.log(`\nBlock: ${BlockchainInstance.BlockchainCache[i].hash}`);
    console.log((0, validator_1.validateBlock)(BlockchainInstance.BlockchainCache[i]));
}
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get("/", (req, res) => res.json(BlockchainInstance.BlockchainCache));
app.listen(8099, () => console.log(`\nCache accessible at 0.0.0.0:8099`));
