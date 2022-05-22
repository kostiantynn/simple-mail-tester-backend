import fastify from "fastify";
import cors from "fastify-cors";
import { Server } from "./server/Server";

const server = new Server(fastify());

server.registerPlugin({
  pluginInstance: cors,
  options: { origin: true, optionsSuccessStatus: 200, credentials: true },
});

server.registerApi();

export default server;
