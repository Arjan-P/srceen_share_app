import http from "http";
import express from "express";
import cors from "cors";
import appRouter from "./server.js";
import { createWSServer } from "./wsServer.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT;
const app = express();
app.use(cors());
app.use("", appRouter);
const server = http.createServer(app);
const wss = createWSServer(server);

server.listen(PORT, () => {
  console.log(`HTTP + WS on port: ${PORT}`)
})
