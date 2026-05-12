import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
} from '@react-email/components';

interface MonthlyPaymentReminderProps {
  paymentUrl: string;
  amount: string;
  dueDate: string;
  userName?: string;
  locale: string;
}

const messages = {
  es: {
    title: 'Recordatorio de pago mensual',
    greeting: 'Hola',
    message: (amount: string, dueDate: string) =>
      `Te recordamos que tienes un pago mensual pendiente de ${amount} con vencimiento el ${dueDate}.`,
    buttonText: 'Realizar pago',
    footer: 'Agradecemos tu puntualidad en los pagos.',
    subject: 'Recordatorio de pago mensual',
  },
  en: {
    title: 'Monthly Payment Reminder',
    greeting: 'Hello',
    message: (amount: string, dueDate: string) =>
      `This is a reminder that you have a monthly payment of ${amount} due on ${dueDate}.`,
    buttonText: 'Make Payment',
    footer: 'Thank you for your prompt payment.',
    subject: 'Monthly Payment Reminder',
  },
};

export default function MonthlyPaymentReminder({ paymentUrl, amount, dueDate, userName, locale }: MonthlyPaymentReminderProps) {
  const t = messages[locale as keyof typeof messages] || messages.es;
  const greeting = userName ? `${t.greeting} ${userName},` : `${t.greeting},`;

  return (
    <Html>
      <Head>
        <title>{t.title}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Trends172Tech</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>{t.message(amount, dueDate)}</Text>

            <Button href={paymentUrl} style={button}>
              {t.buttonText}
            </Button>

            <Text style={paragraph}>
              <a href={paymentUrl} style={link}>{paymentUrl}</a>
            </Text>

            <Hr style={hr} />

            <Text style={footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '20px 48px',
  backgroundColor: '#f6f9fc',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const content = {
  padding: '40px 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const button = {
  backgroundColor: '#f39c12',
  borderRadius: '5px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  margin: '20px 0',
};

const link = {
  color: '#f39c12',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};