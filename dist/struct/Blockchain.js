"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const BlockGenerator_1 = require("./BlockGenerator");
const keyPair = {
    public: fs_1.default.readFileSync(path_1.default.join(__dirname, "../keys/publickey.pem")),
    private: fs_1.default.readFileSync(path_1.default.join(__dirname, "../keys/privatekey.pem"))
};
class Blockchain {
    constructor() {
        this.BlockchainCache = [];
        const genesisBlock = new BlockGenerator_1.BlockGenerator({ data: keyPair.public.toString() || "Genesis Block" }, false);
        if (!(0, BlockGenerator_1.isBlockEntry)(genesisBlock) || typeof genesisBlock === "boolean")
            throw new Error("Failed to initialize genesis block!");
        this.BlockchainCache = [
            this.generateEntry(genesisBlock)
        ];
    }
    obtainLatestBlock() {
        return this.BlockchainCache[this.BlockchainCache.length - 1];
    }
    generateEntry(blockData) {
        const previousBlock = this.obtainLatestBlock();
        if (blockData.meta.nonce === (previousBlock === null || previousBlock === void 0 ? void 0 : previousBlock.meta.nonce)) {
            console.log(`Duplicate BlockEntry detected - nonce "${blockData.meta.nonce}"`);
            return blockData;
        }
        blockData.previousHash = (previousBlock === null || previousBlock === void 0 ? void 0 : previousBlock.hash) || null;
        blockData.hash = blockData.computeHash().digest("hex");
        this.BlockchainCache.push(blockData);
        return blockData;
    }
    // TODO: move this method to ../lib/validator.js
    validate() {
        console.log("\nChecking block validity...");
        for (let i = 0; i < this.BlockchainCache.length; i++) {
            const currentBlock = this.BlockchainCache[i];
            const previousBlock = this.BlockchainCache[i - 1] || null;
            if (currentBlock.hash !== currentBlock.computeHash().digest("hex") && currentBlock.hash !== null) {
                console.log(`\n! MISMATCH ! - Computed hash does not match stored hash.\nComputed: ${currentBlock.computeHash().digest("hex")}\nStored: ${currentBlock.hash}`);
                return false;
            }
            if (currentBlock.previousHash !== (previousBlock === null || previousBlock === void 0 ? void 0 : previousBlock.hash) && currentBlock.previousHash !== null) {
                console.log(`\n! MISMATCH ! - Stored previous hash does not match previous block's stored hash.\nCurrentBlock Stored PreviousHash: ${currentBlock.previousHash}\nPreviousBlock Stored CurrentHash: ${previousBlock === null || previousBlock === void 0 ? void 0 : previousBlock.hash}`);
                return false;
            }
            console.log(`Validated block ${currentBlock.hash}`);
        }
        return true;
    }
}
exports.Blockchain = Blockchain;
