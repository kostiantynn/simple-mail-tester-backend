import * as controller from "./controller";
import { RouteOptions, RegisterOptions, RouteHandlerMethod } from "fastify";

export const opts: RegisterOptions = {
  prefix: "/api",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/mailbox",
    handler: controller.createNewMailbox,
  },
  {
    method: "POST",
    url: "/mailbox",
    handler: <RouteHandlerMethod>controller.analyzeMailbox,
  },
  {
    method: "DELETE",
    url: "/mailbox",
    handler: <RouteHandlerMethod>controller.deleteMailBox,
  },
];
