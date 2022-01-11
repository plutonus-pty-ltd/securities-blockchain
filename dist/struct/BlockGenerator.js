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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockGenerator = exports.isBlockEntry = void 0;
require("dotenv").config();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Crypto = __importStar(require("crypto"));
const keyPair = {
    public: fs_1.default.readFileSync(path_1.default.join(__dirname, "../keys/publickey.pem")).toString("ascii"),
    private: fs_1.default.readFileSync(path_1.default.join(__dirname, "../keys/privatekey.pem")).toString("ascii")
};
const isBlockEntry = (data) => !(data === null || data === void 0 ? void 0 : data.invalid);
exports.isBlockEntry = isBlockEntry;
class BlockGenerator {
    constructor({ previousHash, data }, encrypt = true) {
        if (!data)
            throw new Error("Data not provided.");
        this.meta = {
            encrypted: encrypt,
            nonce: Crypto.randomBytes(16).toString("hex").slice(0, 32),
            invalid: false,
            timestamp: Date.now(),
            signature: null
        };
        this.hash = this.computeHash().digest("hex");
        let tempData;
        this.data = data;
        if (encrypt)
            tempData = Crypto.publicEncrypt({
                key: keyPair.public,
                padding: Crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256"
            }, Buffer.from(this.data.toString()));
        const signature = Crypto.createSign("RSA-SHA256").update(tempData || this.data.toString()).sign({
            key: keyPair.private,
            passphrase: process.env.SECRETKEY_PASSPHRASE
        }, "base64");
        this.meta.signature = signature || null;
        if (encrypt)
            this.data = (tempData === null || tempData === void 0 ? void 0 : tempData.toString("base64")) || Buffer.from(data.toString(), "ascii").toString("base64");
        this.previousHash = previousHash || null;
        this.hash = this.computeHash().digest("hex");
        return this;
    }
    computeHash() {
        return Crypto.createHash("sha256").update(`${this.previousHash}${this.meta.nonce}${this.meta.timestamp}${typeof this.data === "string" ? this.data : JSON.stringify(this.data)}`);
    }
}
exports.BlockGenerator = BlockGenerator;
