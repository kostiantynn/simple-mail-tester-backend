import { exec } from "child_process";
import { promisify } from "util";

class MailboxManagerService {
  execPromisfied = promisify(exec);
  userName: string = "";

  constructor() {
    this.userName = this.createRandomUserName();
  }

  createRandomUserName() {
    return `test-${Math.random().toString(36).slice(2)}`;
  }

  async createTempUserForMailbox() {
    try {
      const { stdout, stderr } = await this.execPromisfied(
        `echo "user created: ${this.userName}" | useradd -m -s /bin/bash ${this.userName}`
      );
      console.log("Output", stdout);
      console.log("Error", stderr);
      return this.userName;
    } catch (erorr) {
      console.log("Error", erorr);
      return {
        erorr,
      };
    }
  }
  async deleteTempUser() {
    try {
      const { stdout, stderr } = await this.execPromisfied(
        `echo "user deleted: ${this.userName}" | deluser --remove-home ${this.userName}`
      );
      console.log("Output", stdout);
      console.log("Error", stderr);
      return this.userName;
    } catch (erorr) {
      console.log("Error", erorr);
      return {
        erorr,
      };
    }
  }
  async readMessageForGivenUser() {
    throw new Error("Method is empty");
  }
}

export { MailboxManagerService };
