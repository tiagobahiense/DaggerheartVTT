import { DOMAIN_OPTIONS } from './cardSearch';

export interface CardCastEvent {
  id: number;
  charId: string;
  charName: string;
  cardName: string;
  cardPath: string;
  cardCategory: string;
  tipoDominio: string | null;
  corDominio: string;
  nivelDominio: number | null;
}

const DEFAULT_DOMAIN_COLOR = '#D4AF37';

export function resolveDomainColor(
  tipoDominio?: string | null,
  corDominio?: string | null
): string {
  if (corDominio) return corDominio;
  if (tipoDominio) {
    const match = DOMAIN_OPTIONS.find(
      (d) => d.id === tipoDominio || d.label === tipoDominio
    );
    if (match) return match.color;
  }
  return DEFAULT_DOMAIN_COLOR;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const match = normalized.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return `rgba(212, 175, 55, ${alpha})`;
  return `rgba(${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}, ${alpha})`;
}

export function parseCardCastEvent(data: unknown): CardCastEvent | null {
  if (!data || typeof data !== 'object') return null;

  const evt = data as Record<string, unknown>;
  if (typeof evt.id !== 'number' || typeof evt.charName !== 'string') return null;

  const tipoDominio = typeof evt.tipoDominio === 'string' ? evt.tipoDominio : null;

  return {
    id: evt.id,
    charId: typeof evt.charId === 'string' ? evt.charId : '',
    charName: evt.charName,
    cardName: typeof evt.cardName === 'string' ? evt.cardName : '',
    cardPath: typeof evt.cardPath === 'string' ? evt.cardPath : '',
    cardCategory: typeof evt.cardCategory === 'string' ? evt.cardCategory : '',
    tipoDominio,
    corDominio:
      typeof evt.corDominio === 'string'
        ? evt.corDominio
        : resolveDomainColor(tipoDominio),
    nivelDominio: typeof evt.nivelDominio === 'number' ? evt.nivelDominio : null,
  };
}
