export interface IMailboxValidation {
  rawMessage: string;
  parsedMessage: any;

  validateRDNS(): { [key: string]: any };
  validateSPF(): { [key: string]: any };
  validateDKIM(): { [key: string]: any };
  validateDMARC(): { [key: string]: any };
  parseMail(): void;
}
