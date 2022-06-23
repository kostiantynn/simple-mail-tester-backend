import { ErrorsTypes } from "../common/errorTypes";
import { RestError } from "../common/restError";

export const messageDidNotComeInTime = () =>
  new Promise((_resolve, reject) =>
    setTimeout(
      () =>
        reject(
          new RestError(
            ErrorsTypes.BadRequest,
            "There is no message in mailbox, please try again"
          ).json
        ),
      60000
    )
  );
