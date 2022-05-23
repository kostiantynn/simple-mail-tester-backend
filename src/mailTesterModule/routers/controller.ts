import { FastifyReply, FastifyRequest } from "fastify";
import tempMailboxDataStore from "../utils/mailboxManager/tempMailboxDataStore";
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
  if (userName) {
    const emailContent = await tempMailboxDataStore.readMessageForGivenUser(
      userName
    );
    rep.status(200).send({ content: emailContent });
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
