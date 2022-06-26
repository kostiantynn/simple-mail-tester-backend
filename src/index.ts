import server from "./server";

(async () => {
  await server.initServer(process.env.DEV_PORT, process.env.PROD_PORT);
})();
