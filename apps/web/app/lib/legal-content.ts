export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  summary: string;
  updatedLabel: string;
  updatedDate: string;
  sections: LegalSection[];
};

const COMPANY = 'Trends172Tech LLC';
const EMAIL = 'trends172tech@gmail.com';

const privacy: Record<'es' | 'en', LegalPageContent> = {
  es: {
    eyebrow: 'Centro de confianza',
    title: 'Política de privacidad',
    summary:
      'Explica cómo Trends172Tech LLC recopila, utiliza, protege y comparte información cuando una persona visita el sitio o utiliza nuestros sistemas, agentes y servicios.',
    updatedLabel: 'Última actualización',
    updatedDate: '31 de julio de 2026',
    sections: [
      {
        title: '1. Responsable y alcance',
        paragraphs: [
          `${COMPANY}, una compañía de responsabilidad limitada activa en Florida, Estados Unidos, es responsable de este sitio y de los servicios que ofrece directamente. Esta política cubre trends172tech.com, Trends Projects, LUNA y las experiencias digitales que enlacen expresamente a esta página.`,
          'Cuando operamos una solución por encargo de una empresa, club u organización, esa entidad puede determinar la finalidad de ciertos datos. En esos casos actuamos como proveedor y también aplican el contrato y la política del cliente.',
        ],
      },
      {
        title: '2. Información que podemos tratar',
        items: [
          'Datos de cuenta y contacto, como nombre, correo, teléfono, empresa, cargo e imagen de perfil.',
          'Datos de autenticación, sesiones, permisos, organización y actividad de seguridad.',
          'Contenido incorporado a proyectos, agentes, conversaciones, archivos, bases de conocimiento, reportes y solicitudes de soporte.',
          'Datos comerciales y operativos, como propuestas, presupuestos, facturas, pagos registrados, licencias, tareas e hitos.',
          'Datos técnicos, como dirección IP, navegador, dispositivo, registros de errores, rendimiento y uso del servicio.',
          'Información que el usuario decide enviar mediante formularios, correo, WhatsApp u otros canales habilitados.',
        ],
      },
      {
        title: '3. Para qué utilizamos la información',
        items: [
          'Crear y proteger cuentas, verificar identidad y aplicar roles y permisos.',
          'Prestar, personalizar, mantener y mejorar los servicios contratados.',
          'Procesar solicitudes, proyectos, soporte, comunicaciones operativas y obligaciones comerciales.',
          'Prevenir fraude, abuso, accesos no autorizados e incidentes de seguridad.',
          'Cumplir obligaciones legales y ejercer o defender derechos.',
          'Generar respuestas mediante inteligencia artificial cuando el usuario activa una función que la utiliza.',
        ],
      },
      {
        title: '4. Inteligencia artificial y proveedores',
        paragraphs: [
          'Algunas funciones pueden enviar el contenido necesario a proveedores tecnológicos para generar una respuesta o ejecutar una tarea. Dependiendo del servicio activado, estos proveedores pueden incluir plataformas de inteligencia artificial, infraestructura en la nube, bases de datos, almacenamiento, correo y seguridad.',
          'Aplicamos minimización de datos y controles de acceso. Los usuarios no deben introducir secretos, categorías sensibles ni información de terceros salvo que exista autorización y sea necesario para el servicio contratado.',
        ],
      },
      {
        title: '5. Cuándo compartimos información',
        paragraphs: [
          'Podemos compartir información con proveedores que procesan datos siguiendo nuestras instrucciones; con el cliente u organización propietaria de la cuenta; cuando exista consentimiento; o cuando sea necesario por ley, seguridad o una operación corporativa.',
          'No vendemos información personal por dinero ni operamos un negocio de publicidad conductual entre contextos.',
        ],
      },
      {
        title: '6. Conservación y seguridad',
        paragraphs: [
          'Conservamos los datos durante el tiempo necesario para prestar el servicio, mantener registros legítimos y cumplir obligaciones legales. El periodo depende del tipo de cuenta, contrato y dato. Cuando corresponde, eliminamos o anonimizamos la información de forma segura.',
          'Usamos medidas administrativas, técnicas y organizativas razonables. Ningún sistema es infalible; la información sobre controles y reporte de vulnerabilidades está disponible en nuestra página de Seguridad.',
        ],
      },
      {
        title: '7. Derechos y solicitudes',
        paragraphs: [
          `Según la jurisdicción, una persona puede solicitar acceso, corrección, eliminación, portabilidad, limitación u oposición. Para ejercer un derecho, escriba a ${EMAIL}. Podemos verificar la identidad antes de responder y, cuando los datos pertenezcan a una cuenta empresarial, coordinar la solicitud con esa organización.`,
        ],
      },
      {
        title: '8. Menores de edad',
        paragraphs: [
          'El sitio corporativo y sus servicios comerciales no están dirigidos a menores de 13 años. Las soluciones para clubes, escuelas u organizaciones juveniles deben utilizarse bajo la administración del cliente y las autorizaciones aplicables. No solicitamos deliberadamente a un menor que cree una cuenta independiente sin los controles requeridos.',
        ],
      },
      {
        title: '9. Cambios y contacto',
        paragraphs: [
          `Publicaremos aquí los cambios e indicaremos la fecha de actualización. Preguntas o solicitudes de privacidad: ${EMAIL}.`,
        ],
      },
    ],
  },
  en: {
    eyebrow: 'Trust center',
    title: 'Privacy policy',
    summary:
      'This policy explains how Trends172Tech LLC collects, uses, protects, and shares information when someone visits our website or uses our systems, agents, and services.',
    updatedLabel: 'Last updated',
    updatedDate: 'July 31, 2026',
    sections: [
      {
        title: '1. Controller and scope',
        paragraphs: [
          `${COMPANY}, an active Florida limited liability company in the United States, is responsible for this website and the services it provides directly. This policy covers trends172tech.com, Trends Projects, LUNA, and digital experiences that expressly link to this page.`,
          'When we operate a solution on behalf of a company, club, or organization, that entity may determine the purpose of certain data processing. In those cases, we act as a service provider and the customer agreement and privacy terms also apply.',
        ],
      },
      {
        title: '2. Information we may process',
        items: [
          'Account and contact data such as name, email, phone number, company, role, and profile image.',
          'Authentication, session, permission, organization, and security activity data.',
          'Content added to projects, agents, conversations, files, knowledge bases, reports, and support requests.',
          'Commercial and operational data such as proposals, budgets, invoices, recorded payments, licenses, tasks, and milestones.',
          'Technical data such as IP address, browser, device, error logs, performance, and service usage.',
          'Information a user chooses to provide through forms, email, WhatsApp, or other enabled channels.',
        ],
      },
      {
        title: '3. How we use information',
        items: [
          'Create and protect accounts, verify identity, and enforce roles and permissions.',
          'Provide, personalize, maintain, and improve contracted services.',
          'Handle requests, projects, support, operational communications, and commercial obligations.',
          'Prevent fraud, abuse, unauthorized access, and security incidents.',
          'Meet legal obligations and establish, exercise, or defend rights.',
          'Generate AI-assisted responses when a user activates a feature that uses artificial intelligence.',
        ],
      },
      {
        title: '4. Artificial intelligence and providers',
        paragraphs: [
          'Some features may send the content required to technology providers to generate a response or complete a task. Depending on the activated service, these providers may include AI platforms, cloud infrastructure, databases, storage, email, and security services.',
          'We apply data-minimization and access controls. Users should not enter secrets, sensitive categories, or third-party information unless they are authorized and the information is necessary for the contracted service.',
        ],
      },
      {
        title: '5. When we share information',
        paragraphs: [
          'We may share information with providers that process data under our instructions; the customer or organization that owns the account; with consent; or when required for law, safety, or a corporate transaction.',
          'We do not sell personal information for money and do not operate a cross-context behavioral advertising business.',
        ],
      },
      {
        title: '6. Retention and security',
        paragraphs: [
          'We retain data as needed to provide the service, preserve legitimate records, and meet legal obligations. The period depends on the account, contract, and data type. Where appropriate, we securely delete or anonymize information.',
          'We use reasonable administrative, technical, and organizational safeguards. No system is infallible; information about controls and vulnerability reporting is available on our Security page.',
        ],
      },
      {
        title: '7. Rights and requests',
        paragraphs: [
          `Depending on the jurisdiction, a person may request access, correction, deletion, portability, restriction, or objection. To submit a request, email ${EMAIL}. We may verify identity before responding and, when data belongs to a business account, coordinate the request with that organization.`,
        ],
      },
      {
        title: '8. Children',
        paragraphs: [
          'Our corporate website and commercial services are not directed to children under 13. Solutions for clubs, schools, or youth organizations must be used under customer administration and applicable authorizations. We do not knowingly ask a child to create an independent account without required controls.',
        ],
      },
      {
        title: '9. Changes and contact',
        paragraphs: [
          `We will post changes here and identify the update date. Privacy questions or requests: ${EMAIL}.`,
        ],
      },
    ],
  },
};

const terms: Record<'es' | 'en', LegalPageContent> = {
  es: {
    eyebrow: 'Condiciones de servicio',
    title: 'Términos de uso',
    summary:
      'Estas condiciones regulan el acceso al sitio y a los servicios digitales ofrecidos directamente por Trends172Tech LLC.',
    updatedLabel: 'Última actualización',
    updatedDate: '31 de julio de 2026',
    sections: [
      { title: '1. Aceptación y contratos', paragraphs: [`Al acceder o utilizar un servicio de ${COMPANY}, usted acepta estos términos. Una propuesta, orden, contrato, acuerdo de tratamiento de datos o condiciones específicas del cliente prevalecerán si existe una contradicción.`] },
      { title: '2. Cuentas y autorización', items: ['Debe proporcionar información exacta y proteger sus credenciales.', 'La organización cliente controla sus usuarios, roles y contenido.', 'Debe notificarnos de inmediato si sospecha acceso no autorizado.', 'Solo puede usar el servicio si tiene capacidad legal y autorización de la organización que representa.'] },
      { title: '3. Uso aceptable', items: ['No infringir leyes, derechos de terceros, privacidad ni propiedad intelectual.', 'No introducir malware, eludir controles, probar vulnerabilidades sin autorización ni afectar la disponibilidad del servicio.', 'No utilizar el servicio para fraude, vigilancia indebida, discriminación, explotación de menores o decisiones prohibidas.', 'No revender, copiar o extraer sistemáticamente el servicio salvo autorización contractual.'] },
      { title: '4. Inteligencia artificial', paragraphs: ['Las funciones de IA pueden producir resultados incompletos, inexactos o inesperados. El usuario debe revisar los resultados antes de utilizarlos en decisiones importantes. El servicio no sustituye asesoría legal, médica, financiera ni profesional cualificada.', 'El cliente es responsable de contar con derechos y autorizaciones sobre las instrucciones y datos que incorpora.'] },
      { title: '5. Propiedad intelectual', paragraphs: ['Trends172Tech LLC y sus licenciantes conservan los derechos sobre la plataforma, software, diseño, marcas y documentación. El cliente conserva los derechos que tenga sobre su contenido. Nos concede los permisos limitados necesarios para operar y proteger el servicio.'] },
      { title: '6. Servicios de terceros', paragraphs: ['Algunas funciones dependen de proveedores externos. Sus condiciones pueden aplicar y su disponibilidad puede cambiar. No somos responsables de servicios externos fuera de nuestro control, aunque seleccionamos y administramos proveedores de manera razonable.'] },
      { title: '7. Pagos, suspensión y terminación', paragraphs: ['Los precios, impuestos, renovaciones y fechas de pago se definen en la propuesta u orden aplicable. Podemos limitar o suspender el acceso por falta de pago, riesgo de seguridad, uso prohibido o exigencia legal, procurando avisar cuando sea razonable. Cualquiera de las partes puede terminar según el acuerdo aplicable.'] },
      { title: '8. Garantías y responsabilidad', paragraphs: ['Los servicios se prestan con cuidado comercial razonable y, salvo garantía escrita adicional, se ofrecen según disponibilidad. En la medida permitida por la ley, no garantizamos que sean ininterrumpidos o libres de errores. Las limitaciones de responsabilidad aplicables se establecerán en el contrato del cliente y no excluirán responsabilidades que la ley no permita limitar.'] },
      { title: '9. Ley aplicable y contacto', paragraphs: [`Salvo acuerdo escrito distinto, estos términos se rigen por las leyes del Estado de Florida, Estados Unidos, sin perjuicio de derechos obligatorios del consumidor. Consultas: ${EMAIL}.`] },
    ],
  },
  en: {
    eyebrow: 'Service conditions',
    title: 'Terms of use',
    summary: 'These terms govern access to the website and digital services offered directly by Trends172Tech LLC.',
    updatedLabel: 'Last updated',
    updatedDate: 'July 31, 2026',
    sections: [
      { title: '1. Acceptance and contracts', paragraphs: [`By accessing or using a ${COMPANY} service, you accept these terms. A proposal, order, contract, data-processing agreement, or customer-specific terms will control if there is a conflict.`] },
      { title: '2. Accounts and authority', items: ['You must provide accurate information and protect your credentials.', 'The customer organization controls its users, roles, and content.', 'You must notify us promptly if you suspect unauthorized access.', 'You may use the service only if you have legal capacity and authority from the organization you represent.'] },
      { title: '3. Acceptable use', items: ['Do not violate laws, third-party rights, privacy, or intellectual property.', 'Do not introduce malware, bypass controls, test vulnerabilities without authorization, or disrupt service availability.', 'Do not use the service for fraud, improper surveillance, discrimination, child exploitation, or prohibited decisions.', 'Do not resell, copy, or systematically extract the service unless contractually authorized.'] },
      { title: '4. Artificial intelligence', paragraphs: ['AI features may produce incomplete, inaccurate, or unexpected results. Users must review outputs before using them for important decisions. The service is not a substitute for qualified legal, medical, financial, or other professional advice.', 'Customers are responsible for having the necessary rights and permissions for the instructions and data they provide.'] },
      { title: '5. Intellectual property', paragraphs: ['Trends172Tech LLC and its licensors retain rights in the platform, software, design, marks, and documentation. Customers retain the rights they hold in their content and grant us the limited permissions needed to operate and protect the service.'] },
      { title: '6. Third-party services', paragraphs: ['Some features depend on external providers. Their terms may apply and their availability may change. We are not responsible for external services outside our control, although we select and manage providers reasonably.'] },
      { title: '7. Payment, suspension, and termination', paragraphs: ['Prices, taxes, renewals, and payment dates are defined in the applicable proposal or order. We may limit or suspend access for nonpayment, security risk, prohibited use, or legal requirements, with notice where reasonable. Either party may terminate as provided in the applicable agreement.'] },
      { title: '8. Warranties and liability', paragraphs: ['We provide services with reasonable commercial care and, unless an additional written warranty applies, on an available basis. To the extent permitted by law, we do not guarantee uninterrupted or error-free operation. Applicable liability limits will be stated in the customer contract and will not exclude liability that cannot legally be limited.'] },
      { title: '9. Governing law and contact', paragraphs: [`Unless a written agreement states otherwise, these terms are governed by the laws of the State of Florida, United States, without limiting mandatory consumer rights. Questions: ${EMAIL}.`] },
    ],
  },
};

const security: Record<'es' | 'en', LegalPageContent> = {
  es: {
    eyebrow: 'Seguridad y confianza',
    title: 'Prácticas de seguridad',
    summary: 'Controles actuales, responsabilidades compartidas y canal para reportar una posible vulnerabilidad.',
    updatedLabel: 'Última actualización',
    updatedDate: '31 de julio de 2026',
    sections: [
      { title: 'Protección de acceso', items: ['Autenticación con sesiones protegidas y contraseñas almacenadas mediante hash.', 'Roles y permisos para limitar operaciones administrativas.', 'Separación lógica por organización en las funciones multiempresa.', 'Secretos de producción administrados fuera del código fuente.'] },
      { title: 'Protección operativa', items: ['Cifrado de transporte mediante HTTPS.', 'Registros técnicos y de auditoría para investigar actividad relevante.', 'Validación de entradas y controles de autorización en operaciones sensibles.', 'Proveedores especializados para infraestructura, base de datos, correo, almacenamiento e inteligencia artificial.'] },
      { title: 'Responsabilidad compartida', paragraphs: ['Cada cliente debe administrar sus usuarios, permisos, dispositivos, contenido y autorizaciones. Recomendamos contraseñas únicas, revisión periódica de accesos y notificación inmediata de actividad sospechosa.'] },
      { title: 'Reporte responsable', paragraphs: [`Si cree haber encontrado una vulnerabilidad, escriba a ${EMAIL} con el asunto “Seguridad”. Incluya el servicio afectado, pasos de reproducción y posible impacto. No acceda a datos ajenos, no interrumpa el servicio y no publique la información antes de que podamos investigarla.`] },
      { title: 'Estado de aseguramiento', paragraphs: ['Mantenemos un programa de mejora continua y documentamos controles y evidencias. Actualmente no afirmamos poseer certificaciones SOC 2, ISO 27001, HIPAA ni otras certificaciones que no hayan sido auditadas formalmente. Los requisitos adicionales se evalúan por contrato.'] },
    ],
  },
  en: {
    eyebrow: 'Security and trust',
    title: 'Security practices',
    summary: 'Current safeguards, shared responsibilities, and the channel for reporting a potential vulnerability.',
    updatedLabel: 'Last updated',
    updatedDate: 'July 31, 2026',
    sections: [
      { title: 'Access protection', items: ['Authentication with protected sessions and hashed password storage.', 'Roles and permissions that restrict administrative operations.', 'Logical organization separation in multi-company features.', 'Production secrets managed outside source code.'] },
      { title: 'Operational protection', items: ['Transport encryption through HTTPS.', 'Technical and audit logs for investigating relevant activity.', 'Input validation and authorization checks for sensitive operations.', 'Specialized providers for infrastructure, databases, email, storage, and artificial intelligence.'] },
      { title: 'Shared responsibility', paragraphs: ['Each customer must manage its users, permissions, devices, content, and authorizations. We recommend unique passwords, periodic access reviews, and immediate reporting of suspicious activity.'] },
      { title: 'Responsible reporting', paragraphs: [`If you believe you found a vulnerability, email ${EMAIL} with the subject “Security”. Include the affected service, reproduction steps, and potential impact. Do not access another person’s data, disrupt the service, or publish information before we can investigate.`] },
      { title: 'Assurance status', paragraphs: ['We maintain a continuous-improvement program and document controls and evidence. We do not currently claim SOC 2, ISO 27001, HIPAA, or other certifications that have not been formally audited. Additional requirements are evaluated by contract.'] },
    ],
  },
};

export const legalContent = { privacy, terms, security };

export function resolveLegalLocale(locale: string): 'es' | 'en' {
  return locale.startsWith('es') ? 'es' : 'en';
}

export const legalCompany = { name: COMPANY, email: EMAIL };
