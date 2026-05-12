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

interface VerifyEmailProps {
  verificationUrl: string;
  userName?: string;
  locale: string;
}

const messages = {
  es: {
    title: 'Verificar correo electrónico',
    greeting: 'Hola',
    message: 'Gracias por registrarte. Para completar tu cuenta, verifica tu correo electrónico.',
    buttonText: 'Verificar correo',
    footer: 'Si no creaste esta cuenta, puedes ignorar este correo.',
    subject: 'Verifica tu correo electrónico',
  },
  en: {
    title: 'Verify Email',
    greeting: 'Hello',
    message: 'Thanks for signing up. To complete your account, please verify your email.',
    buttonText: 'Verify Email',
    footer: 'If you did not create this account, you can ignore this email.',
    subject: 'Verify your email',
  },
};

export default function VerifyEmail({ verificationUrl, userName, locale }: VerifyEmailProps) {
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
            <Text style={paragraph}>{t.message}</Text>

            <Button href={verificationUrl} style={button}>
              {t.buttonText}
            </Button>

            <Text style={paragraph}>
              <a href={verificationUrl} style={link}>{verificationUrl}</a>
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