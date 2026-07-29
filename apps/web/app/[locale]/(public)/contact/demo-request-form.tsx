'use client';

import { FormEvent, useState } from 'react';

type DemoRequestFormProps = {
  locale: string;
};

export function DemoRequestForm({ locale }: DemoRequestFormProps) {
  const spanish = locale.startsWith('es');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[520px] flex-col justify-center rounded-[32px] border border-[#00aeb3]/15 bg-white p-8 shadow-[0_28px_90px_rgba(17,20,24,.08)] sm:p-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8fbf8] text-xl text-[#00aeb3]">✓</span>
        <h2 className="mt-7 text-3xl font-semibold tracking-[-.035em] text-[#111418]">
          {spanish ? 'Solicitud recibida.' : 'Request received.'}
        </h2>
        <p className="mt-4 max-w-md text-lg leading-8 text-[#66717a]">
          {spanish
            ? 'Revisaremos tu operación para preparar una demostración enfocada en tus procesos y necesidades reales.'
            : 'We will review your operation and prepare a demonstration focused on your real processes and needs.'}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 w-fit rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#20252b] transition hover:border-[#00aeb3]/45 hover:text-[#008f94]"
        >
          {spanish ? 'Enviar otra solicitud' : 'Send another request'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-black/[.06] bg-white p-6 shadow-[0_28px_90px_rgba(17,20,24,.08)] sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? 'Nombre y apellido' : 'Full name'}</span>
          <input required name="name" autoComplete="name" className="w-full rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition placeholder:text-[#a0a7ae] focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10" placeholder={spanish ? 'Tu nombre' : 'Your name'} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? 'Empresa u organización' : 'Company or organisation'}</span>
          <input required name="company" autoComplete="organization" className="w-full rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition placeholder:text-[#a0a7ae] focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10" placeholder={spanish ? 'Nombre de la empresa' : 'Company name'} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? 'Correo o WhatsApp' : 'Email or WhatsApp'}</span>
          <input required name="contact" className="w-full rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition placeholder:text-[#a0a7ae] focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10" placeholder={spanish ? 'Cómo podemos contactarte' : 'How we can reach you'} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? 'Tipo de operación' : 'Type of operation'}</span>
          <select required name="operation" defaultValue="" className="w-full rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10">
            <option value="" disabled>{spanish ? 'Selecciona una opción' : 'Select an option'}</option>
            <option value="commerce">{spanish ? 'Comercio y distribución' : 'Commerce and distribution'}</option>
            <option value="services">{spanish ? 'Servicios profesionales' : 'Professional services'}</option>
            <option value="sports">{spanish ? 'Deporte y formación' : 'Sports and education'}</option>
            <option value="other">{spanish ? 'Otra operación' : 'Other operation'}</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? 'Tamaño del equipo' : 'Team size'}</span>
          <select required name="teamSize" defaultValue="" className="w-full rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10">
            <option value="" disabled>{spanish ? 'Selecciona un rango' : 'Select a range'}</option>
            <option value="1-5">1–5</option>
            <option value="6-20">6–20</option>
            <option value="21-50">21–50</option>
            <option value="51+">51+</option>
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#3f4650]">{spanish ? '¿Qué quieres mejorar?' : 'What would you like to improve?'}</span>
          <textarea required name="challenge" rows={5} className="w-full resize-none rounded-2xl border border-black/10 bg-[#fbfcfb] px-4 py-3.5 outline-none transition placeholder:text-[#a0a7ae] focus:border-[#00aeb3]/60 focus:ring-4 focus:ring-[#00aeb3]/10" placeholder={spanish ? 'Cuéntanos brevemente cómo funciona tu operación y cuál es el principal reto.' : 'Briefly describe your operation and its main challenge.'} />
        </label>
      </div>

      <button type="submit" className="mt-6 w-full rounded-full bg-[#111418] px-7 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(17,20,24,.14)] transition hover:-translate-y-0.5 hover:bg-[#00aeb3]">
        {spanish ? 'Solicitar demostración' : 'Request a demonstration'} <span className="ml-3 text-[#4de0dc]">→</span>
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[#8a9199]">
        {spanish ? 'Sin compromiso. La demostración se prepara según tu operación.' : 'No commitment. The demonstration is prepared around your operation.'}
      </p>
    </form>
  );
}
