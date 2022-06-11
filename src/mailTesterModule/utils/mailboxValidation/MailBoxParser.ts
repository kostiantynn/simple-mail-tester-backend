import { simpleParser } from "mailparser";
import { promisify } from "util";
import { ValidationType } from "./validationTypes";

const simpleParserPromisfied = promisify(simpleParser);

export class MailBoxParser {
  rawMessage: string;
  parsedMessage: any;
  private _senderIp: string;
  private _DKIMParams: { [key: string]: string };
  private _validationResults: Record<string, unknown>[] = [];

  constructor(rawMessage: string) {
    this.rawMessage = rawMessage;
  }

  public async parseMail() {
    try {
      this.parsedMessage = await simpleParserPromisfied(this.rawMessage);
      const DKIM = this.parsedMessage.headers.get("dkim-signature");
      if (DKIM) {
        this._DKIMParams = DKIM.params;
      } else {
        this.addNewValidationResult = {
          ...this.generateResultBasedOnValidation(
            true,
            false,
            ValidationType.DKIM
          ),
          validationData: {
            message: "Dkim Params was not found in payload of email message.",
          },
        };
      }
    } catch (error) {
      this.addNewValidationResult = {
        result: "Validation Failed",
        passed: false,
        type: ValidationType.MailParser,
      };
    }
  }

  protected generateResultBasedOnValidation(
    result: any,
    validationKey: any,
    validationType: ValidationType
  ): { [key: string]: any } {
    return result == validationKey
      ? { result: "Validation passed", passed: true, type: validationType }
      : { result: "Validation Failed", passed: false, type: validationType };
  }

  protected set addNewValidationResult(validationResult: {
    [key: string]: any;
  }) {
    this._validationResults.push(validationResult);
  }
  public get validationResults() {
    return this._validationResults;
  }
  protected set senderIp(ip: string) {
    this._senderIp = ip;
  }
  protected get senderIp() {
    return this._senderIp;
  }
  protected get DKIMParams() {
    return this._DKIMParams;
  }
}
