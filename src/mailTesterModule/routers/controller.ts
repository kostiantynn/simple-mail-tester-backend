import { FastifyReply, FastifyRequest } from "fastify";
import tempMailboxDataStore from "../utils/mailboxManager/tempMailboxDataStore";
import { MailboxValidation } from "../utils/mailboxValidation/mailboxValidationService";
import { RouteGenericInterfaceDeleteAnalyzeMailbox } from "./reqInterface";

const createNewMailbox = async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    const newMailboxUser =
      await tempMailboxDataStore.createTempUserForMailbox();
    rep.status(200).send({ userName: newMailboxUser });
  } catch (error) {
    rep.status(400).send(error);
  }
};

const analyzeMailbox = async (
  req: FastifyRequest<RouteGenericInterfaceDeleteAnalyzeMailbox>,
  rep: FastifyReply
) => {
  const userName = req.body.userName;
  const headers = rep.getHeaders();
  process.on(
    "uncaughtException",
    function uncaughtExceptionCallback(error: any) {
      rep.sent = true;
      rep.raw.writeHead(400, headers);
      rep.raw.write(error);
      process.removeListener("uncaughtException", uncaughtExceptionCallback);
      rep.raw.end();
    }
  );
  if (userName) {
    try {
      const emailContent = <string>(
        await tempMailboxDataStore.readMessageForGivenUser(userName)
      );
      const mailBoxValidator = new MailboxValidation(emailContent);
      await mailBoxValidator.parseMail();
      await mailBoxValidator.validateRDNS();
      await mailBoxValidator.validateSPF();
      await mailBoxValidator.validateDKIM();
      await mailBoxValidator.validateDMARC();
      const validationResults = mailBoxValidator.validationResults;
      rep.status(200).send({ validationResults });
    } catch (error: any) {
      rep.status(400).send({
        error,
      });
    }
  } else {
    rep.status(400).send({
      error: "Username wasn't provided.",
    });
  }
};

const deleteMailBox = async (
  req: FastifyRequest<RouteGenericInterfaceDeleteAnalyzeMailbox>,
  rep: FastifyReply
) => {
  const userName = req.body.userName;
  if (userName) {
    try {
      const deletedUser = await tempMailboxDataStore.deleteTempUser(userName);
      rep.status(200).send({ userName: deletedUser });
    } catch (error) {
      rep.status(400).send(error);
    }
  } else {
    rep.status(400).send({
      error: "Username wasn't provided.",
    });
  }
};

export { createNewMailbox, analyzeMailbox, deleteMailBox };
