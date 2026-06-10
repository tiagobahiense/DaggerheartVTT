import { ISheetMarker } from '../types/sheetExtras';

const normalizeKey = (value: string) =>
  value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '') || '';

export function getClassCommunityMarkers(
  className: string,
  community: string,
  level: number
): ISheetMarker[] {
  const markers: ISheetMarker[] = [];
  const cls = normalizeKey(className);
  const comm = normalizeKey(community);

  if (cls === 'mago') {
    markers.push({
      id: 'strange_patterns',
      key: 'strange_patterns',
      label: 'Padrões Estranhos',
      type: 'number',
      value: 7,
      min: 1,
      max: 12,
      source: 'class',
      isClassSpecific: true,
      description:
        'Ao rolar este número em um Dado do Destino, ganhe 1 Esperança ou recupere 1 PF. Troque em descanso longo.',
    });
  }

  if (cls === 'bardo') {
    const sides = level >= 5 ? 8 : 6;
    markers.push({
      id: 'inspiration_die',
      key: 'inspiration_die',
      label: 'Dado de Inspiração',
      type: 'dice',
      value: 0,
      dieSides: sides,
      max: sides,
      source: 'class',
      isClassSpecific: true,
      description: `d${sides} — some a testes, reações ou dano; ou recupere PF igual ao resultado.`,
    });
  }

  if (cls === 'guardiao') {
    const sides = level >= 5 ? 6 : 4;
    markers.push({
      id: 'determination',
      key: 'determination',
      label: 'Determinação',
      type: 'dice',
      value: 1,
      dieSides: sides,
      max: sides,
      source: 'class',
      isClassSpecific: true,
      description: `d${sides} — começa em 1, +1 ao causar dano que retire PV.`,
    });
  }

  if (comm.includes('maritima')) {
    markers.push({
      id: 'tide_markers',
      key: 'tide_markers',
      label: 'Conhecer a Maré',
      type: 'counter',
      value: 0,
      source: 'community',
      isClassSpecific: true,
      description: 'Acumula ao rolar com Medo. Gaste antes de um teste para +1 por marcador.',
    });
  }

  return markers;
}

export function mergeSheetMarkers(
  saved: ISheetMarker[] | undefined,
  className: string,
  community: string,
  level: number
): ISheetMarker[] {
  const defaults = getClassCommunityMarkers(className, community, level);
  if (!saved?.length) return defaults;

  const savedMap = new Map(saved.map((m) => [m.key, m]));
  const result: ISheetMarker[] = [];

  for (const def of defaults) {
    const existing = savedMap.get(def.key);
    if (existing) {
      result.push({
        ...def,
        ...existing,
        label: def.label,
        type: def.type,
        dieSides: def.dieSides ?? existing.dieSides,
        max: def.max ?? existing.max,
        min: def.min ?? existing.min,
      });
      savedMap.delete(def.key);
    } else {
      result.push(def);
    }
  }

  for (const custom of savedMap.values()) {
    result.push(custom);
  }

  return result;
}

export function createCustomMarker(): ISheetMarker {
  const id = `custom_${Date.now()}`;
  return {
    id,
    key: id,
    label: 'Marcador',
    type: 'counter',
    value: 0,
    source: 'custom',
    isClassSpecific: false,
  };
}
