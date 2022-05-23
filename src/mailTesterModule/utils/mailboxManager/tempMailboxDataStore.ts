import { MailboxManagerService } from "./mailboxManagerService";

class TempMailboxDataStore extends MailboxManagerService {
  MailboxDataStore = new Map<string, object>();

  public async createTempUserForMailbox() {
    const userName = this.createRandomUserName();
    try {
      const newUser = await super.createTempUserForMailbox(userName);
      this.MailboxDataStore.set(newUser, { rawMailMessage: undefined });
      return userName;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async deleteTempUser(userName: string) {
    if (this.MailboxDataStore.get(userName)) {
      try {
        const deletedUser = await super.deleteTempUser(userName);
        this.MailboxDataStore.delete(deletedUser);
        return deletedUser;
      } catch (error: any) {
        throw new Error(error);
      }
    } else {
      throw new Error(
        JSON.stringify({ error: `No data found for username: ${userName}` })
      );
    }
  }

  public async readMessageForGivenUser(userName: string) {
    if (this.MailboxDataStore.get(userName)) {
      const rawMailMessage = await super.readMessageForGivenUser(userName);
      this.MailboxDataStore.set(userName, { rawMailMessage });
      return rawMailMessage;
    } else {
      throw new Error(
        JSON.stringify({ error: `No data found for username: ${userName}` })
      );
    }
  }
}

export default new TempMailboxDataStore();
