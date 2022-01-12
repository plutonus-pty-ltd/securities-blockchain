import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", (req: Request, res: Response) => res.json(router.stack));

router.get("/all", async (req: Request, res: Response) => {
	const blockchain = await prisma.block.findMany({});
	if(!blockchain) return res.status(500).json({
		err: true,
		message: "Blockchain still initializing, please wait."
	});
	res.json(blockchain.map(block => { return { hash: block.hash, timestamp: block.timestamp } }));
});

router.get("/:hash", async (req: Request, res: Response) => {
	const entry = await prisma.block.findUnique({
		where: { hash: req.params.hash }
	});

	if(!entry) return res.status(404).json({
		err: true,
		message: `Block not found: ${req.params.hash}`
	});

	return res.json(entry);
});

export default {
	router,
	baseEndpoint: "/fetch"
}
