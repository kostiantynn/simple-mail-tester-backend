export interface CustomError {
  statusCode: number;
  errorMessage: string;
}

export const ErrorsTypes = {
  BadRequest: {
    statusCode: 400,
    errorMessage: "Bad request. Request has wrong format.",
  },
  Unauthorized: {
    statusCode: 401,
    errorMessage: "Unauthorized. Authentication credentials not valid.",
  },
  Forbidden: {
    statusCode: 403,
    errorMessage:
      "Forbidden. You're missing permission to execute this request.",
  },
  NotFound: {
    statusCode: 404,
    errorMessage: "Not Found. No information to display.",
  },
  WrongOperation: {
    statusCode: 409,
    errorMessage: "This operation cannot be performed.",
  },
  ServerError: {
    statusCode: 500,
    errorMessage:
      "Server encountered an unexpected condition that prevented it from fulfilling the request.",
  },
} as const;
