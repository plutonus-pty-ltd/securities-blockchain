"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockGenerator = exports.isBlockEntry = void 0;
const Crypto = __importStar(require("crypto"));
const isBlockEntry = (data) => !(data === null || data === void 0 ? void 0 : data.invalid);
exports.isBlockEntry = isBlockEntry;
class BlockGenerator {
    constructor({ previousHash, data }) {
        if (!data)
            throw new Error("Data not provided.");
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
    computeHash() {
        return Crypto.createHash("sha256").update(`${this.previousHash}${this.meta.nonce}${this.meta.timestamp}${typeof this.data === "string" ? this.data : JSON.stringify(this.data)}`);
    }
}
exports.BlockGenerator = BlockGenerator;
