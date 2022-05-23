import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import { IncomingMessage, Server as httpServer, ServerResponse } from "http";
import { plugin, pluginSet, router, routerSet } from "./serverTypes";

export class Server {
  private setOfRouters: routerSet;
  private setOfPlugins: pluginSet;
  private serverInstace: FastifyInstance<
    httpServer,
    IncomingMessage,
    ServerResponse
  >;
  constructor(
    server: FastifyInstance<httpServer, IncomingMessage, ServerResponse>,
    routerSet?: routerSet,
    pluginSet?: pluginSet
  ) {
    this.setOfRouters = routerSet ?? [];
    this.setOfPlugins = pluginSet ?? [];
    this.serverInstace = server;
  }
  public setEnvVariables(envParamsObject: { [key: string]: any }) {
    for (let envParamName in envParamsObject) {
      process.env[envParamName] = envParamsObject[envParamName];
    }
  }
  public registerPlugin(plugin: plugin) {
    this.setOfPlugins.push(plugin);
  }
  public registerRouter(router: router) {
    this.setOfRouters.push(router);
  }
  private registerPlugins() {
    this.setOfPlugins.forEach((plugin: plugin) => {
      this.serverInstace.register(plugin.pluginInstance, plugin.options);
    });
  }
  private registerRouters() {
    this.setOfRouters.forEach((router: router) => {
      let { routes, opts } = router;
      //routes = generalHook.applyGeneralHookRreSerialization(routes);
      const plugin = (
        server: FastifyInstance,
        opts: FastifyPluginOptions,
        done: () => unknown
      ) => {
        routes.forEach((route: RouteOptions) => {
          server.route(route);
        });
        done();
      };
      this.serverInstace.register(plugin, opts);
    });
  }
  public registerApi() {
    this.registerPlugins();
    this.registerRouters();
  }

  public async initServer(port: string, host: string) {
    await this.serverInstace.listen(port, host);
  }
}
