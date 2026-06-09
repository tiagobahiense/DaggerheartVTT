export interface SearchableCard {
  nome: string;
  caminho: string;
  categoria: string;
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
  return normalizeCardText(`${card.nome} ${strippedName} ${pathHint} ${card.categoria}`);
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
    return words.every((word) => fuzzyWordMatch(word, haystack));
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
      score -= levenshtein(query, stripped.slice(0, query.length + 3));
      return { card, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ card }) => card);
}
