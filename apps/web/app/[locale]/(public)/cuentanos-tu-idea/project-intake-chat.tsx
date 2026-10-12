'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES, getIntakeQuestion, getIntakeAck, INTERVIEW_LENGTH } from '@/lib/project-intake/questions';
import type { IntakeCategory } from '@/lib/project-intake/questions';

type Message = { role: 'agent' | 'user'; content: string };
type Details = { description: string; existingSystem: string; problem: string; goals: string; timeline: string; budget: string };
const initialDetails: Details = { description: '', existingSystem: '', problem: '', goals: '', timeline: '', budget: '' };
const fields: (keyof Details)[] = ['description', 'problem', 'existingSystem', 'goals', 'timeline', 'budget'];

export function ProjectIntakeChat({ locale }: { locale: 'es' | 'en' }) {
  const es = locale === 'es';
  const [sessionId] = useState(() => crypto.randomUUID());
  const [category, setCategory] = useState<IntakeCategory | null>(null);
  const [step, setStep] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [details, setDetails] = useState<Details>(initialDetails);
  const [projectTitle, setProjectTitle] = useState('');
  const [answer, setAnswer] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '', company: '', country: '' });
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<'select' | 'interview' | 'review' | 'submitted'>('select');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  function start(selected: IntakeCategory) {
    if (!consent) return;
    setCategory(selected);
    setTranscript([{ role: 'agent', content: getIntakeQuestion(selected, 0, locale) }]);
    setStage('interview');
  }

  async function save(draft: { category: IntakeCategory; details: Details; transcript: Message[]; projectTitle: string; contact: typeof contact }, finalize: boolean) {
    const response = await fetch('/api/project-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, locale, ...draft, consent: true, finalize })
    });
    const json = await response.json() as { error?: string; submitted?: boolean; reference?: string };
    if (!response.ok) throw new Error(json.error || 'No se pudo guardar.');
    return json;
  }

  async function sendAnswer() {
    if (!category || busy || answer.trim().length < 2) return;
    const responseText = answer.trim();
    const updatedDetails = { ...details, [fields[step]]: responseText };
    const history = [...transcript, { role: 'user' as const, content: responseText }];
    setBusy(true);
    setError('');
    setAnswer('');
    let reply = getIntakeAck(responseText, locale);
    const nextStep = step + 1;
    const nextQuestion = nextStep < INTERVIEW_LENGTH ? getIntakeQuestion(category, nextStep, locale) : null;
    try {
      const ai = await fetch('/api/project-intake/assist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, locale, step, answer: responseText, transcript: history.slice(-10) })
      });
      if (ai.ok) {
        const response = await ai.json() as { reply?: string };
        if (response.reply) reply = response.reply;
      }
    } catch { /* Continue guided interview if the optional assistant is offline. */ }
    const finalMessages: Message[] = [...history, { role: 'agent', content: reply }];
    if (nextQuestion) finalMessages.push({ role: 'agent', content: nextQuestion });
    setDetails(updatedDetails);
    setTranscript(finalMessages);
    setStep(nextStep);
    if (!nextQuestion) setStage('review');
    try {
      await save({ category, details: updatedDetails, transcript: finalMessages, projectTitle, contact }, false);
    } catch {
      setError(es ? 'No se guardó el borrador en el servidor. Puedes continuar y reintentar el envío final.' : 'Draft was not saved on the server. You can continue and retry at the end.');
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!category || busy || !consent) return;
    setBusy(true);
    setError('');
    try {
      const data = await save({ category, details, transcript, projectTitle, contact }, true);
      setReference(data.reference || '');
      setStage('submitted');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar.');
    } finally {
      setBusy(false);
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_-60px_rgba(15,23,42,.3)]">
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-6 text-white sm:px-9">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-teal-300">Trends172Tech · {es ? 'Asesor de proyectos' : 'Project advisor'}</p>
        <h2 className="mt-2 text-2xl font-semibold">{es ? 'Tu idea merece una buena conversación.' : 'Every great idea starts with a conversation.'}</h2>
        <p className="mt-2 text-sm text-slate-300">{es ? 'Un diagnóstico guiado para entender tu idea, sin compromiso de contratación.' : 'A guided discovery process to understand your vision.'}</p>
      </div>
      <div className="space-y-5 px-5 py-7 sm:px-9">
        {stage === 'select' && <>
          <p className="font-medium">{es ? '¿Qué te gustaría hacer?' : 'How can we help you?'}</p>
          <label className="mb-4 flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" /><span>{es ? 'Autorizo el tratamiento de la información de esta conversación para preparar una propuesta y contactarme. ' : 'I authorize the processing of this conversation to prepare a proposal and contact me. '}<Link href={'/' + locale + '/privacy'} className="font-semibold text-teal-700 underline">{es ? 'Política de privacidad' : 'Privacy policy'}</Link></span></label>
          <div className="grid gap-3 sm:grid-cols-2">{CATEGORIES.map(item =>
            <button key={item.id} disabled={!consent} type="button" onClick={() => start(item.id)} className="rounded-2xl border border-slate-200 p-5 text-left font-medium transition hover:border-teal-500 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50">{es ? item.es : item.en} →</button>
          )}</div>
        </>}
        {stage === 'interview' && <>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{es ? 'Conversación' : 'Discovery'} · {Math.min(step + 1, INTERVIEW_LENGTH)}/{INTERVIEW_LENGTH}</p>
          <div className="max-h-[440px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4" aria-live="polite">{transcript.map((message, index) =>
            <p key={index} className={'max-w-[90%] rounded-2xl p-3 text-sm leading-6 ' + (message.role === 'user' ? 'ml-auto bg-teal-700 text-white' : 'bg-white text-slate-800 shadow-sm')}>{message.content}</p>
          )}</div>
          <label className="block space-y-2"><span className="text-sm font-medium">{es ? 'Tu respuesta' : 'Your answer'}</span>
            <textarea className={inputClass} rows={3} maxLength={1500} value={answer} onChange={event => setAnswer(event.target.value)} placeholder={es ? 'Cuéntame con tus palabras...' : 'Tell me about your idea...'} />
          </label>
          <button type="button" disabled={busy || answer.trim().length < 2} onClick={sendAnswer} className="rounded-full bg-slate-950 px-7 py-3 font-semibold text-white disabled:opacity-50">{busy ? '...' : es ? 'Continuar →' : 'Continue →'}</button>
        </>}
        {stage === 'review' && <>
          <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{es ? 'Resumen y contacto' : 'Review and contact'}</p>
            <h3 className="mt-2 text-2xl font-semibold">{es ? 'Revisa tu solicitud antes de enviarla' : 'Review your project request'}</h3>
            <p className="mt-2 text-sm text-slate-500">{es ? 'Puedes corregir lo que nos contaste. No compartas contraseñas ni información confidencial.' : 'Edit the information below. Do not share passwords or confidential data.'}</p>
          </div>
          <label className="block space-y-1"><span className="text-sm font-medium">{es ? 'Nombre de tu idea o proyecto' : 'Project name'}</span><input className={inputClass} maxLength={160} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required /></label>
          {fields.map((field, index) =>
            <label key={field} className="block space-y-1"><span className="text-sm font-medium">{[
              es ? 'Describe tu idea' : 'Describe your idea',
              es ? 'Problema que deseas resolver' : 'Problem to solve',
              es ? 'Cómo funciona actualmente' : 'Current operation',
              es ? 'Funciones y objetivos' : 'Features and goals',
              es ? 'Plazo deseado' : 'Preferred timeline',
              es ? 'Inversión aproximada (opcional)' : 'Indicative budget (optional)'
            ][index]}</span><textarea rows={index === 0 ? 3 : 2} className={inputClass} value={details[field]} maxLength={index === 0 ? 6000 : 3000} onChange={e => setDetails(prev => ({ ...prev, [field]: e.target.value }))} /></label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">{([
            ['name', es ? 'Nombre y apellido' : 'Full name'],
            ['email', 'Email'],
            ['phone', es ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'],
            ['company', es ? 'Empresa (opcional)' : 'Company (optional)'],
            ['country', es ? 'País (opcional)' : 'Country (optional)']
          ] as const).map(([field, label]) =>
            <label key={field} className="block space-y-1"><span className="text-sm font-medium">{label}</span><input type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} className={inputClass} maxLength={field === 'email' ? 200 : 120} value={contact[field]} onChange={e => setContact(prev => ({ ...prev, [field]: e.target.value }))} /></label>
          )}</div>
          <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />
            <span>{es ? 'Autorizo a Trends172Tech a guardar mis datos y contactarme sobre esta solicitud, de acuerdo con su ' : 'I allow Trends172Tech to save my contact details and contact me about this request, under the '}
              <Link href={'/' + locale + '/privacy'} className="font-semibold text-teal-700 underline">{es ? 'política de privacidad' : 'privacy policy'}</Link>.</span>
          </label>
          <button type="button" disabled={busy || !consent || !contact.name.trim() || !contact.email.trim() || !contact.phone.trim() || !projectTitle.trim()} onClick={submit} className="rounded-full bg-slate-950 px-7 py-3 font-semibold text-white disabled:opacity-50">{busy ? '...' : es ? 'Registrar mi idea →' : 'Submit my idea →'}</button>
        </>}
        {stage === 'submitted' && <div className="space-y-3 py-8 text-center">
          <p className="text-4xl text-teal-600">✓</p>
          <h3 className="text-2xl font-semibold">{es ? 'Solicitud registrada' : 'Request received'}</h3>
          <p>{es ? 'Número de referencia:' : 'Reference number:'} <strong>{reference}</strong></p>
          <p className="text-slate-600">{es ? 'Nuestro equipo revisará tu idea y te contactará. Recibirás un correo de confirmación si el servicio está disponible.' : 'Our team will review your idea and contact you. An email confirmation will be sent if the mail service is available.'}</p>
        </div>}
        {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
      </div>
    </div>
  );
}
