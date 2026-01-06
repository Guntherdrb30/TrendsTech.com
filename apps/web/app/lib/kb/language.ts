const SPANISH_HINTS = [' el ', ' la ', ' los ', ' las ', ' de ', ' que ', ' para ', ' con ', ' una '];
const ENGLISH_HINTS = [' the ', ' and ', ' for ', ' with ', ' that ', ' from ', ' this ', ' are '];

export function detectLanguage(text: string) {
  const sample = ` ${text.toLowerCase().slice(0, 4000)} `;
  let es = 0;
  let en = 0;

  for (const hint of SPANISH_HINTS) {
    if (sample.includes(hint)) {
      es += 1;
    }
  }

  for (const hint of ENGLISH_HINTS) {
    if (sample.includes(hint)) {
      en += 1;
    }
  }

  if (es === en) {
    return 'unknown';
  }

  return es > en ? 'es' : 'en';
}
