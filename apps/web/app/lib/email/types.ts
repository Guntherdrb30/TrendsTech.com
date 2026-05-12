export type EmailTemplate =
  | 'reset-password'
  | 'verify-email'
  | 'budget-sent'
  | 'proposal-sent'
  | 'invoice-sent'
  | 'license-expiring'
  | 'monthly-payment-reminder';

export interface EmailTemplateData {
  'reset-password': {
    resetUrl: string;
    userName?: string;
  };
  'verify-email': {
    verificationUrl: string;
    userName?: string;
  };
  'budget-sent': {
    budgetUrl: string;
    clientName: string;
    projectName: string;
    budgetAmount?: string;
    userName?: string;
  };
  'proposal-sent': {
    proposalUrl: string;
    clientName: string;
    projectName: string;
    proposalAmount?: string;
    userName?: string;
  };
  'invoice-sent': {
    invoiceUrl: string;
    clientName: string;
    invoiceNumber: string;
    invoiceAmount: string;
    dueDate: string;
    userName?: string;
  };
  'license-expiring': {
    licenseName: string;
    expirationDate: string;
    renewalUrl: string;
    userName?: string;
  };
  'monthly-payment-reminder': {
    paymentUrl: string;
    amount: string;
    dueDate: string;
    userName?: string;
  };
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: EmailTemplate;
  templateData?: EmailTemplateData[EmailTemplate];
  replyTo?: string;
  locale?: string;
}

export interface EmailResult {
  ok: boolean;
  error?: string;
  emailId?: string;
}

export interface EmailConfig {
  from: string;
  replyTo: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<EmailResult>;
  isConfigured(): boolean;
}