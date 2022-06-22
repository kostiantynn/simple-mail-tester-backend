import { exec } from "child_process";
import { promisify } from "util";
import { watch, FSWatcher } from "chokidar";
import { readFile } from "fs/promises";
import { messageDidNotComeInTime } from "./helpers";

class MailboxManagerService {
  private execPromisfied = promisify(exec);

  protected createRandomUserName() {
    return `test-${Math.random().toString(36).slice(2)}`;
  }

  public async createTempUserForMailbox(userName: string) {
    try {
      const { stdout, stderr } = await this.execPromisfied(
        `echo "user created: ${userName}" | useradd -m -s /bin/bash ${userName}`
      );
      console.log("Output", stdout);
      console.log("Error", stderr);
      return userName;
    } catch (error: any) {
      console.log("Error", error);
      throw new Error(error);
    }
  }

  public async deleteTempUser(userName: string) {
    try {
      const { stdout, stderr } = await this.execPromisfied(
        `echo "user deleted: ${userName}" | deluser --remove-home ${userName}`
      );
      console.log("Output", stdout);
      console.log("Error", stderr);
      return userName;
    } catch (erorr: any) {
      console.log("Error", erorr);
      const { stdout, stderr } = await this.execPromisfied(
        `echo "user deleted: ${userName}" | deluser ${userName}`
      );
      return userName;
    }
  }
  public async readMessageForGivenUser(userName: string) {
    const timerFallout = setTimeout(messageDidNotComeInTime, 10000);
    const watcher = watch(`/home/${userName}`, {
      depth: 4,
      ignored: /(^|[\/\\])\../,
    });
    const mailboxData = await this.getWatchedFile(watcher);
    clearTimeout(timerFallout);
    return mailboxData;
  }

  private getWatchedFile(watcher: FSWatcher) {
    return new Promise((resolve, reject) => {
      watcher.on("add", async (path: string) => {
        if (
          new RegExp(process.env.HOSTNAME!).test(<string>path.split("/").pop())
        ) {
          try {
            const emailData = await readFile(path);
            watcher.removeAllListeners("on");
            resolve(emailData.toString("utf-8"));
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
}

export { MailboxManagerService };
