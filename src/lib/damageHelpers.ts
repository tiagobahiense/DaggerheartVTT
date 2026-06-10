export type DamageSeverity = 'minor' | 'major' | 'severe';

export function parseDieSides(damageStr: string): number {
  const match = damageStr?.match(/d(\d+)/i);
  return match ? parseInt(match[1], 10) : 6;
}

export function parseWeaponModifier(damageStr: string): number {
  const match = damageStr?.match(/d\d+\s*([+-]\s*\d+)/i);
  if (!match) return 0;
  return parseInt(match[1].replace(/\s/g, ''), 10) || 0;
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollDamage(
  proficiency: number,
  dieSides: number,
  weaponMod: number,
  isCritical = false
): { rolls: number[]; total: number; maxRoll?: number[] } {
  const count = Math.max(1, proficiency);
  const rolls = Array.from({ length: count }, () => rollDie(dieSides));
  let allRolls = [...rolls];

  if (isCritical) {
    const maxRoll = Array.from({ length: count }, () => dieSides);
    allRolls = [...maxRoll, ...rolls];
    return {
      rolls: allRolls,
      total: allRolls.reduce((a, b) => a + b, 0) + weaponMod,
      maxRoll,
    };
  }

  return {
    rolls: allRolls,
    total: allRolls.reduce((a, b) => a + b, 0) + weaponMod,
  };
}

export function getDamageSeverity(
  damage: number,
  thresholds: { major: number; severe: number }
): DamageSeverity {
  if (damage >= thresholds.severe) return 'severe';
  if (damage >= thresholds.major) return 'major';
  return 'minor';
}

export function getHpMarkFromSeverity(severity: DamageSeverity): number {
  switch (severity) {
    case 'severe':
      return 3;
    case 'major':
      return 2;
    default:
      return 1;
  }
}

export function reduceSeverity(severity: DamageSeverity): DamageSeverity {
  switch (severity) {
    case 'severe':
      return 'major';
    case 'major':
      return 'minor';
    default:
      return 'minor';
  }
}

export function getSeverityLabel(severity: DamageSeverity): string {
  switch (severity) {
    case 'severe':
      return 'Grave (3 PV)';
    case 'major':
      return 'Maior (2 PV)';
    default:
      return 'Menor (1 PV)';
  }
}
