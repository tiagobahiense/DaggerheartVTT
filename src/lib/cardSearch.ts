export interface SearchableCard {
  nome: string;
  caminho: string;
  categoria: string;
  dominio?: number;
  rank?: number;
  nivel?: string;
  profissao?: string;
  atributo_conjuracao?: string;
}

const PREFIXES = [
  /^feitiço\s*-\s*/i,
  /^grimório\s*-\s*/i,
  /^grimorio\s*-\s*/i,
  /^talento\s*-\s*/i,
  /^domínio\s*-\s*/i,
  /^dominio\s*-\s*/i,
  /^ancestralidade\s*-\s*/i,
  /^comunidade\s*-\s*/i,
  /^classes\s*-\s*/i,
  /^especialização\s*-\s*/i,
  /^especializacao\s*-\s*/i,
  /^fundamental\s*-\s*/i,
  /^maestria\s*-\s*/i,
];

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCardText(value: string): string {
  return stripAccents(value.toLowerCase().trim());
}

export function stripCardPrefixes(name: string): string {
  let result = name;
  for (const pattern of PREFIXES) {
    result = result.replace(pattern, '');
  }
  return result.trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function fuzzyWordMatch(word: string, haystack: string): boolean {
  if (word.length === 0) return true;
  if (haystack.includes(word)) return true;
  if (word.length < 3) return false;

  const tokens = haystack.split(/[\s\-–—]+/).filter(Boolean);
  for (const token of tokens) {
    const maxDist = word.length <= 4 ? 1 : 2;
    if (levenshtein(word, token) <= maxDist) return true;
  }
  return levenshtein(word, haystack.slice(0, word.length + 2)) <= 1;
}

function buildSearchHaystack(card: SearchableCard): string {
  const pathHint = card.caminho
    .replace(/^\/cards\//, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[/\\]/g, ' ');
  const strippedName = stripCardPrefixes(card.nome);
  const parts = [
    card.nome,
    strippedName,
    pathHint,
    card.categoria,
    card.nivel,
    card.profissao,
    card.atributo_conjuracao,
  ];
  if (card.dominio != null) {
    parts.push(`dominio ${card.dominio}`, `nivel ${card.dominio}`, `d${card.dominio}`);
  }
  if (card.rank != null) {
    parts.push(`rank ${card.rank}`);
  }
  return normalizeCardText(parts.filter(Boolean).join(' '));
}

function matchesNumericFilter(card: SearchableCard, word: string): boolean {
  if (!/^\d+$/.test(word)) return false;
  const num = Number(word);
  return card.dominio === num || card.rank === num;
}

export function searchCards<T extends SearchableCard>(
  cards: T[],
  rawQuery: string,
  options?: { categories?: string[] }
): T[] {
  const query = normalizeCardText(rawQuery);
  const words = query.split(/\s+/).filter(Boolean);

  return cards.filter((card) => {
    if (options?.categories && !options.categories.includes(card.categoria)) {
      return false;
    }
    if (words.length === 0) return true;
    const haystack = buildSearchHaystack(card);
    return words.every((word) => fuzzyWordMatch(word, haystack) || matchesNumericFilter(card, word));
  });
}

export function suggestCards<T extends SearchableCard>(
  cards: T[],
  rawQuery: string,
  limit = 3
): T[] {
  const query = normalizeCardText(rawQuery);
  if (query.length < 2) return [];

  const scored = cards
    .map((card) => {
      const haystack = buildSearchHaystack(card);
      const stripped = normalizeCardText(stripCardPrefixes(card.nome));
      let score = 0;
      if (stripped.startsWith(query)) score += 10;
      if (haystack.includes(query)) score += 5;
      if (card.dominio != null && query === String(card.dominio)) score += 8;
      score -= levenshtein(query, stripped.slice(0, query.length + 3));
      return { card, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ card }) => card);
}

export function sortGrimoireCards<T extends SearchableCard>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const catOrder = (c: string) => {
      if (c === 'Feitiço') return 0;
      if (c === 'Talento') return 1;
      if (c === 'Grimório') return 2;
      return 3;
    };
    const catDiff = catOrder(a.categoria) - catOrder(b.categoria);
    if (catDiff !== 0) return catDiff;
    const domA = a.dominio ?? 99;
    const domB = b.dominio ?? 99;
    if (domA !== domB) return domA - domB;
    const rankA = a.rank ?? 99;
    const rankB = b.rank ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

export function formatCardMeta(card: SearchableCard): string | null {
  const parts: string[] = [];
  if (card.dominio != null) parts.push(`Dom. ${card.dominio}`);
  if (card.rank != null && card.rank > 0) parts.push(`#${card.rank}`);
  if (card.nivel) parts.push(card.nivel);
  return parts.length > 0 ? parts.join(' · ') : null;
}
