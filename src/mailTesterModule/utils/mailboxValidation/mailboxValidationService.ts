import { IMailboxValidation } from "./IMailboxValidation";
import { reverse, resolveTxt } from "dns/promises";
import { verify } from "crypto";
import { MailBoxParser } from "./MailBoxParser";
import { ValidationType } from "./validationTypes";
const spf = require("spf-check");

export class MailboxValidation
  extends MailBoxParser
  implements IMailboxValidation
{
  constructor(rawMessage: string) {
    super(rawMessage);
  }

  public async validateRDNS(): Promise<void> {
    const dnsData = this.parsedMessage.headers.get("received")[0];
    const senderIp = dnsData.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    this.senderIp = senderIp[0];
    const senderDomen = dnsData.split(" ")[1];
    const validationResult = this.generateResultBasedOnValidation(
      await reverse(senderIp),
      senderDomen,
      ValidationType.RDNS
    );
    this.addNewValidationResult = {
      ...validationResult,
      validationData: {
        ip: senderIp,
        domen: senderDomen,
      },
    };
  }
  public async validateSPF(): Promise<void> {
    if (this.senderIp == "") throw new Error("Sender IP wasn't found");
    const validationResult = this.generateResultBasedOnValidation(
      await spf(this.senderIp, this.DKIMParams.d),
      "Pass",
      ValidationType.SPF
    );
    const spfRecord = await resolveTxt(this.DKIMParams.d);
    this.validationResults.push({
      ...validationResult,
      validationData: {
        spf: spfRecord,
      },
    });
  }
  public async validateDKIM(): Promise<void> {
    const requiredHeadersForDkim = this.DKIMParams.h.split(":");
    let parsedMessageForDKIM = requiredHeadersForDkim
      .map((header: string) => {
        let parsedHeader = header.trim().toLowerCase();
        let tempHeaderLine = this.parsedMessage.headerLines.find(
          (headerLine: any) => headerLine.key == parsedHeader
        );
        if (tempHeaderLine) {
          let itemsHeaderLine = tempHeaderLine.line.split(":");
          return `${itemsHeaderLine[0].toLowerCase().trim()}:${itemsHeaderLine
            .slice(1)
            .join(":")
            .trim()}\r\n`;
        }
      })
      .filter((headerItem: any) => headerItem != undefined);

    const dkimSignatureHeaderItem = this.parsedMessage.headerLines
      .find((headerLine: any) => headerLine.key == "dkim-signature")
      .line.replace(/\r\n/gm, " ")
      .replace(/\t/gm, "");

    let dkimSignatureHeaderItems = dkimSignatureHeaderItem.split(":");
    let otherHeaders = dkimSignatureHeaderItems.slice(1).join(":");
    otherHeaders = otherHeaders.replace(/b=(.*)/gm, "b=;").trim();
    parsedMessageForDKIM.push(
      [
        dkimSignatureHeaderItems[0].toLowerCase(),
        ...otherHeaders.split(":"),
      ].join(":")
    );

    const publicKey = await this.generatePublicKeyForDKIM();
    const messageBuffer = this.DKIMParams.b.replace(/\s/, "");
    const verifyRes = verify(
      "rsa-sha256",
      Buffer.from(parsedMessageForDKIM.join("")),
      Buffer.from(publicKey),
      Buffer.from(messageBuffer, "base64")
    );
    const validationResult = this.generateResultBasedOnValidation(
      verifyRes,
      true,
      ValidationType.DKIM
    );
    this.addNewValidationResult = {
      ...validationResult,
      validationData: {
        publicKey,
        messageBuffer,
        DKIMMessage: parsedMessageForDKIM.join(""),
      },
    };
  }
  public async validateDMARC() {
    const DMARCRecord = await resolveTxt(`_dmarc.${this.DKIMParams.d}`);
    if (DMARCRecord.length == 0) {
      this.validationResults.push({
        ...this.generateResultBasedOnValidation(
          true,
          false,
          ValidationType.DMARC
        ),
        validationData: {
          message: `DMARC record was not found on ${this.DKIMParams.d}`,
        },
      });
    } else {
      let validationDetails: { [key: string]: any } = {};
      const resolvedDMARCRecord = DMARCRecord[0][0];
      const DMARCPolicy = resolvedDMARCRecord.match(/p=(.*)/gm);
      const DMARCRua = resolvedDMARCRecord.match(/rua=(.*)/gm);
      const DMARCRuf = resolvedDMARCRecord.match(/ruf=(.*)/gm);
      if (DMARCPolicy.length > 0 && DMARCPolicy[0]) {
        let DMARCPolicyParsed = DMARCPolicy[0].replace(/p=(.*)/gm, "");
        validationDetails.policy =
          DMARCPolicyParsed == "none"
            ? "DMARC Quarantine/Reject policy Not enabled"
            : "DMARC Quarantine/Reject policy enabled";
      } else {
        validationDetails.policy = "Policy was not found.";
      }
      if (
        (DMARCRua.length > 0 && DMARCRua[0]) ||
        (DMARCRuf.length > 0 && DMARCRuf[0])
      ) {
        validationDetails.reports = "DNS DMARC RUA / RUF domains valid";
      }
      this.addNewValidationResult = {
        ...this.generateResultBasedOnValidation(
          true,
          false,
          ValidationType.DMARC
        ),
        validationDetails,
      };
    }
  }

  private async generatePublicKeyForDKIM() {
    const publicKeyQuery = await resolveTxt(
      `${this.DKIMParams.s}._domainkey.${this.DKIMParams.d}`
    );
    if (publicKeyQuery.length != 0) {
      const pubKeyResult = publicKeyQuery[publicKeyQuery.length][0];
      const pubKey = pubKeyResult.match(/p=(.*)/gm)[0].replace(/p=/, "");
      let parsedPubKey = "-----BEGIN PUBLIC KEY-----\n";
      let tempIndex = 0;
      for (let i = 0; i < pubKey.length; i++) {
        if (i % 64 == 0 && i != 0) {
          parsedPubKey += pubKey.slice(tempIndex, i) + "\n";
          tempIndex = i;
        }
      }
      parsedPubKey += pubKey.slice(tempIndex) + "\n-----END PUBLIC KEY-----";
      return parsedPubKey;
    } else {
      throw new Error("Public key does not exists on knows DNS record");
    }
  }
}
