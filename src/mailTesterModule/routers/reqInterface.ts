import {
  RequestHeadersDefault,
  RequestParamsDefault,
  RequestQuerystringDefault,
} from "fastify";
import { ReplyGenericInterface } from "fastify/types/reply";

interface RequestGenericInterfaceDeleteAnalyzeMailbox {
  Querystring?: RequestQuerystringDefault;
  Params?: RequestParamsDefault;
  Headers?: RequestHeadersDefault;
  Body: {
    userName: string;
  };
}

export interface RouteGenericInterfaceDeleteAnalyzeMailbox
  extends RequestGenericInterfaceDeleteAnalyzeMailbox,
    ReplyGenericInterface {}
