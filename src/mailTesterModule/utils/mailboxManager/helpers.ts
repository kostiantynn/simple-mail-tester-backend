import { ErrorsTypes } from "../common/errorTypes";
import { RestError } from "../common/restError";

export const messageDidNotComeInTime = () =>
  setTimeout(() => {
    throw new RestError(
      ErrorsTypes.BadRequest,
      "There is no message in mailbox, please try again"
    );
  }, 60000);
