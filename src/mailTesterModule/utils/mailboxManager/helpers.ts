export const messageDidNotComeInTime = () => {
  throw new Error("There is no message in mailbox, please try again");
};
