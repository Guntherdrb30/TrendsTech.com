import type { z } from 'zod';
import type { projectCategory } from './schema';

export type IntakeCategory = z.infer<typeof projectCategory>;

export const CATEGORIES: { id: IntakeCategory; es: string; en: string }[] = [
  { id: 'NEW', es: 'Crear un software desde cero', en: 'Build a new software product' },
  { id: 'IMPROVE', es: 'Mejorar una plataforma existente', en: 'Improve my current platform' },
  { id: 'AUTOMATE', es: 'Automatizar procesos con IA', en: 'Automate work with AI' },
  { id: 'INTEGRATE', es: 'Conectar sistemas y agregar funciones', en: 'Integrate systems or add features' },
  { id: 'IDEA', es: 'Explorar una idea de negocio', en: 'Explore a business idea' }
];

const firstQuestion: Record<IntakeCategory, [string, string]> = {
  NEW: ['¿Qué sistema tienes en mente y para quién estaría diseñado?', 'What software do you have in mind and who would use it?'],
  IMPROVE: ['¿Qué plataforma utilizas actualmente y qué quieres mejorar?', 'Which software do you use and what would you improve?'],
  AUTOMATE: ['¿Qué trabajo repetitivo te gustaría automatizar?', 'What repetitive work would you like to automate?'],
  INTEGRATE: ['¿Qué sistemas o aplicaciones necesitas conectar?', 'Which systems or apps do you want to connect?'],
  IDEA: ['Cuéntame tu idea. ¿Qué te gustaría lograr?', 'Tell me your idea. What would you like to achieve?']
};

const followups: [string, string][] = [
  ['¿Cuál es el problema principal que quieres resolver?', 'What is the main problem you want to solve?'],
  ['¿Cómo se realiza hoy ese proceso? Si usas programas o herramientas, puedes mencionarlos.', 'How is the work done today? Mention any tools you currently use.'],
  ['¿Cuáles son las funciones más importantes que debería tener la solución?', 'Which features would matter most in your solution?'],
  ['¿Cuándo te gustaría empezar o tener una primera versión? Puedes decir que aún no lo sabes.', 'When would you like to begin or have an initial version? You can say it is undecided.'],
  ['¿Tienes un rango de inversión previsto? Es opcional; puedes responder "por definir".', 'Do you have an approximate budget? You can say "undecided".']
];

export const INTERVIEW_LENGTH = 6;

export function getIntakeQuestion(category: IntakeCategory, step: number, locale: 'es' | 'en'): string {
  const n = locale === 'es' ? 0 : 1;
  return step === 0 ? firstQuestion[category][n] : (followups[step - 1]?.[n] || '');
}

export function getIntakeAck(text: string, locale: 'es' | 'en'): string {
  const message = text.toLowerCase();
  if (/whatsapp|mensajer/i.test(message)) {
    return locale === 'es' ? 'Entendido. Anoté que la mensajería es importante para tu proyecto.' : 'Noted. Messaging is important for your project.';
  }
  if (/excel|hoja de c|spreadsheet/i.test(message)) {
    return locale === 'es' ? 'Perfecto. Registré el uso actual de hojas de cálculo.' : 'Understood. I noted your current use of spreadsheets.';
  }
  return locale === 'es' ? 'Entendido, lo estoy anotando para nuestro equipo.' : 'Got it. I am documenting that for our team.';
}
