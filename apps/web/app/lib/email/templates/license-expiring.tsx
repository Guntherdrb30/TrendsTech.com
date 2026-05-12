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

interface LicenseExpiringProps {
  licenseName: string;
  expirationDate: string;
  renewalUrl: string;
  userName?: string;
  locale: string;
}

const messages = {
  es: {
    title: 'Licencia expirando',
    greeting: 'Hola',
    message: (licenseName: string, expirationDate: string) =>
      `Tu licencia "${licenseName}" está próxima a expirar el ${expirationDate}.`,
    warning: 'Para evitar interrupciones en el servicio, renueva tu licencia antes de la fecha de expiración.',
    buttonText: 'Renovar licencia',
    footer: 'Si tienes alguna pregunta sobre la renovación, contacta a nuestro equipo de soporte.',
    subject: (licenseName: string) => `Licencia expirando - ${licenseName}`,
  },
  en: {
    title: 'License Expiring',
    greeting: 'Hello',
    message: (licenseName: string, expirationDate: string) =>
      `Your license "${licenseName}" is expiring on ${expirationDate}.`,
    warning: 'To avoid service interruptions, please renew your license before the expiration date.',
    buttonText: 'Renew License',
    footer: 'If you have any questions about renewal, please contact our support team.',
    subject: (licenseName: string) => `License Expiring - ${licenseName}`,
  },
};

export default function LicenseExpiring({ licenseName, expirationDate, renewalUrl, userName, locale }: LicenseExpiringProps) {
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
            <Text style={paragraph}>{t.message(licenseName, expirationDate)}</Text>
            <Text style={paragraph}>{t.warning}</Text>

            <Button href={renewalUrl} style={button}>
              {t.buttonText}
            </Button>

            <Text style={paragraph}>
              <a href={renewalUrl} style={link}>{renewalUrl}</a>
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
  backgroundColor: '#e74c3c',
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
  color: '#e74c3c',
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