import fastify from "fastify";
import cors from "fastify-cors";

import * as mailboxManager from "./mailTesterModule/routers";

import { Server } from "./server/Server";

const server = new Server(fastify());

server.registerPlugin({
  pluginInstance: cors,
  options: { origin: true, optionsSuccessStatus: 200, credentials: true },
});

server.registerRouter(mailboxManager);

server.registerApi();

export default server;
