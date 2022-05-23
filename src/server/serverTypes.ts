import {
  FastifyPluginCallback,
  FastifyPluginOptions,
  RegisterOptions,
  RouteOptions,
} from "fastify";

export type routerSet = { opts: RegisterOptions; routes: RouteOptions[] }[];
export type pluginSet = {
  pluginInstance: FastifyPluginCallback;
  options: FastifyPluginOptions;
}[];

export type router = { opts: RegisterOptions; routes: RouteOptions[] };
export type plugin = {
  pluginInstance: FastifyPluginCallback;
  options: FastifyPluginOptions;
};
