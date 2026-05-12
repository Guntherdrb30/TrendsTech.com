// Core email functionality
export { sendEmail } from './send';
export { sendResendEmail, EMAIL_CONFIG, isEmailConfigured } from './resend';

// Legacy password reset (for backward compatibility)
export { sendPasswordResetEmail } from './reset';

// Types
export type {
  EmailTemplate,
  EmailTemplateData,
  SendEmailOptions,
  EmailResult,
  EmailConfig,
  EmailProvider,
} from './types';