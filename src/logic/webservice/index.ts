import express, { Request, Response, NextFunction } from "express";

import read from "./routes/read";

export function start({ port, originNode }: { port: number, originNode?: boolean }) {
	const app = express();

	app.use("*", (req: Request, res: Response, next: NextFunction) => {
		console.log(`[WEBSERV] ${req.headers["X-Real-Ip"] || req.headers["X-Forwarded-For"] || req.ip} | ${req.method} ${req.originalUrl}`);
		next();
	});

	app.use(read.baseEndpoint, read.router);

	app.listen(port, () => console.log(`[WEBSERV] Ready`));
}
