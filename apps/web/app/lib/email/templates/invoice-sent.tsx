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

interface InvoiceSentProps {
  invoiceUrl: string;
  clientName: string;
  invoiceNumber: string;
  invoiceAmount: string;
  dueDate: string;
  userName?: string;
  locale: string;
}

const messages = {
  es: {
    title: 'Factura enviada',
    greeting: 'Hola',
    message: (clientName: string, invoiceNumber: string) =>
      `Te enviamos la factura ${invoiceNumber} correspondiente a ${clientName}.`,
    amount: (amount: string) => `Monto total: ${amount}`,
    dueDate: (date: string) => `Fecha de vencimiento: ${date}`,
    buttonText: 'Ver factura',
    footer: 'Por favor, realiza el pago antes de la fecha de vencimiento.',
    subject: (invoiceNumber: string) => `Factura enviada - ${invoiceNumber}`,
  },
  en: {
    title: 'Invoice Sent',
    greeting: 'Hello',
    message: (clientName: string, invoiceNumber: string) =>
      `We have sent you invoice ${invoiceNumber} for ${clientName}.`,
    amount: (amount: string) => `Total amount: ${amount}`,
    dueDate: (date: string) => `Due date: ${date}`,
    buttonText: 'View Invoice',
    footer: 'Please make the payment before the due date.',
    subject: (invoiceNumber: string) => `Invoice Sent - ${invoiceNumber}`,
  },
};

export default function InvoiceSent({ invoiceUrl, clientName, invoiceNumber, invoiceAmount, dueDate, userName, locale }: InvoiceSentProps) {
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
            <Text style={paragraph}>{t.message(clientName, invoiceNumber)}</Text>

            <Text style={paragraph}>{t.amount(invoiceAmount)}</Text>
            <Text style={paragraph}>{t.dueDate(dueDate)}</Text>

            <Button href={invoiceUrl} style={button}>
              {t.buttonText}
            </Button>

            <Text style={paragraph}>
              <a href={invoiceUrl} style={link}>{invoiceUrl}</a>
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
  backgroundColor: '#5469d4',
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
  color: '#5469d4',
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