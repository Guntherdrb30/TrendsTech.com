import { LunaFootballDemoClient } from './luna-football-demo-client';

const pricingFixScript = `
(() => {
  const MONTHLY_RATE = 1.5;

  function formatMoney(value) {
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function applyFixes(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const text = node.nodeValue || '';

      if (text.includes('mensualidad operativa es de $1 por jugador activo')) {
        node.nodeValue = text.replace(
          'mensualidad operativa es de $1 por jugador activo',
          'mensualidad operativa es de $1.5 por jugador activo'
        );
      }

      if (text.includes('$1 por jugador/mes')) {
        node.nodeValue = text.replace('$1 por jugador/mes', '$1.5 por jugador/mes');
      }
    }

    document.querySelectorAll('*').forEach((el) => {
      if (el.dataset?.lunaMonthlyFixed === '1') return;
      const text = (el.textContent || '').trim();
      const match = text.match(/^\$([0-9,]+(?:\.[0-9]+)?)\/mes$/);
      if (!match) return;

      const amount = Number(match[1].replace(/,/g, ''));
      if (!Number.isFinite(amount)) return;

      const parentText = el.parentElement?.textContent || '';
      if (!/Segundo mes|Mensualidad desde el segundo mes/i.test(parentText)) return;

      el.textContent = formatMoney(amount * MONTHLY_RATE) + '/mes';
      el.dataset.lunaMonthlyFixed = '1';
    });
  }

  applyFixes();

  const observer = new MutationObserver(() => applyFixes());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

export default function LunaFootballDemoPage() {
  return (
    <>
      <LunaFootballDemoClient />
      <script dangerouslySetInnerHTML={{ __html: pricingFixScript }} />
    </>
  );
}
