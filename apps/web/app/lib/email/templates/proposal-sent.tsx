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

interface ProposalSentProps {
  proposalUrl: string;
  clientName: string;
  projectName: string;
  proposalAmount?: string;
  userName?: string;
  locale: string;
}

const messages = {
  es: {
    title: 'Propuesta enviada',
    greeting: 'Hola',
    message: (clientName: string, projectName: string) =>
      `Te enviamos la propuesta para el proyecto "${projectName}" solicitado por ${clientName}.`,
    amount: (amount: string) => `Monto propuesto: ${amount}`,
    buttonText: 'Ver propuesta',
    footer: 'Si tienes alguna pregunta, no dudes en contactarnos.',
    subject: (projectName: string) => `Propuesta enviada - ${projectName}`,
  },
  en: {
    title: 'Proposal Sent',
    greeting: 'Hello',
    message: (clientName: string, projectName: string) =>
      `We have sent you the proposal for the project "${projectName}" requested by ${clientName}.`,
    amount: (amount: string) => `Proposed amount: ${amount}`,
    buttonText: 'View Proposal',
    footer: 'If you have any questions, please don\'t hesitate to contact us.',
    subject: (projectName: string) => `Proposal Sent - ${projectName}`,
  },
};

export default function ProposalSent({ proposalUrl, clientName, projectName, proposalAmount, userName, locale }: ProposalSentProps) {
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
            <Text style={paragraph}>{t.message(clientName, projectName)}</Text>

            {proposalAmount && (
              <Text style={paragraph}>{t.amount(proposalAmount)}</Text>
            )}

            <Button href={proposalUrl} style={button}>
              {t.buttonText}
            </Button>

            <Text style={paragraph}>
              <a href={proposalUrl} style={link}>{proposalUrl}</a>
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