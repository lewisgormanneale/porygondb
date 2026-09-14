import type { EvolutionDetail } from '../../../shared/interfaces/pokeapi';

function formatResourceName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const GENDER_LABELS: Record<number, string> = {
  1: 'female only',
  2: 'male only',
};

const RELATIVE_PHYSICAL_STATS_LABELS: Record<number, string> = {
  1: 'Attack > Defense',
  0: 'Attack = Defense',
  [-1]: 'Attack < Defense',
};

/**
 * Formats a single PokeAPI EvolutionDetail into a short, human-readable
 * description, e.g. "Level 16", "Use Water Stone", "Trade holding King's Rock".
 * @see https://pokeapi.co/docs/v2#evolution-detail
 */
export function formatEvolutionDetail(detail: EvolutionDetail): string {
  const parts: string[] = [];

  switch (detail.trigger.name) {
    case 'level-up':
      if (detail.min_level) {
        parts.push(`Level ${detail.min_level}`);
      } else {
        parts.push('Level up');
      }
      break;
    case 'trade':
      parts.push(
        detail.trade_species
          ? `Trade for ${formatResourceName(detail.trade_species.name)}`
          : 'Trade'
      );
      break;
    case 'use-item':
      parts.push(detail.item ? `Use ${formatResourceName(detail.item.name)}` : 'Use item');
      break;
    case 'shed':
      parts.push('Empty party slot & spare Poké Ball');
      break;
    case 'three-critical-hits':
      parts.push('Land 3 critical hits in one battle');
      break;
    case 'take-damage':
      parts.push('Take damage at a specific location');
      break;
    case 'tower-of-darkness':
      parts.push('Train at the Tower of Darkness');
      break;
    case 'tower-of-waters':
      parts.push('Train at the Tower of Waters');
      break;
    case 'agile-style-move':
      parts.push('Use an Agile Style move 20 times');
      break;
    case 'strong-style-move':
      parts.push('Use a Strong Style move 20 times');
      break;
    case 'recoil-damage':
      parts.push('Take recoil damage 49+ times');
      break;
    case 'spin':
      parts.push('Spin while holding an item');
      break;
    case 'event':
      parts.push('Special event');
      break;
    case 'other':
      parts.push('Special condition');
      break;
    default:
      parts.push(formatResourceName(detail.trigger.name));
  }

  if (detail.item && detail.trigger.name !== 'use-item') {
    parts.push(`using ${formatResourceName(detail.item.name)}`);
  }
  if (detail.held_item) {
    parts.push(`holding ${formatResourceName(detail.held_item.name)}`);
  }
  if (detail.known_move) {
    parts.push(`knowing ${formatResourceName(detail.known_move.name)}`);
  }
  if (detail.known_move_type) {
    parts.push(`knowing a ${formatResourceName(detail.known_move_type.name)}-type move`);
  }
  if (detail.min_happiness) {
    parts.push('with high friendship');
  }
  if (detail.min_beauty) {
    parts.push('with high Beauty');
  }
  if (detail.min_affection) {
    parts.push('with high affection');
  }
  if (detail.location) {
    parts.push(`at ${formatResourceName(detail.location.name)}`);
  }
  if (detail.time_of_day) {
    parts.push(`during the ${detail.time_of_day}`);
  }
  if (detail.gender !== null && GENDER_LABELS[detail.gender]) {
    parts.push(GENDER_LABELS[detail.gender]);
  }
  if (
    detail.relative_physical_stats !== null &&
    RELATIVE_PHYSICAL_STATS_LABELS[detail.relative_physical_stats]
  ) {
    parts.push(RELATIVE_PHYSICAL_STATS_LABELS[detail.relative_physical_stats]);
  }
  if (detail.party_species) {
    parts.push(`with ${formatResourceName(detail.party_species.name)} in party`);
  }
  if (detail.party_type) {
    parts.push(`with a ${formatResourceName(detail.party_type.name)}-type in party`);
  }
  if (detail.needs_overworld_rain) {
    parts.push('while raining');
  }
  if (detail.turn_upside_down) {
    parts.push('holding console upside-down');
  }

  return parts.join(', ');
}

/**
 * Formats all alternative EvolutionDetails for a single evolution step.
 * Multiple entries represent alternative ("OR") ways to trigger the same evolution.
 */
export function formatEvolutionDetails(details: EvolutionDetail[]): string[] {
  return details.map(formatEvolutionDetail);
}

/**
 * PokeAPI's evolution-chain data occasionally contains multiple EvolutionDetail
 * entries that describe the exact same requirement (a known data quirk, e.g. on
 * Pikachu -> Raichu). Collapse entries that format to identical text so the UI
 * doesn't show the same requirement twice.
 */
export function dedupeEvolutionDetails(details: EvolutionDetail[]): EvolutionDetail[] {
  const seen = new Set<string>();
  return details.filter((detail) => {
    const text = formatEvolutionDetail(detail);
    if (seen.has(text)) {
      return false;
    }
    seen.add(text);
    return true;
  });
}

export type EvolutionMethodVisual =
  | { kind: 'item'; itemName: string }
  | { kind: 'level'; level: number }
  | { kind: 'icon'; icon: string };

/**
 * Picks a single representative icon (or item sprite, or level number) for an
 * EvolutionDetail, used as a compact at-a-glance indicator alongside the full
 * text description. A required level is shown as the number itself rather
 * than a generic icon, since it's the single most decision-relevant detail.
 */
export function getEvolutionMethodVisual(detail: EvolutionDetail): EvolutionMethodVisual {
  if (detail.item) {
    return { kind: 'item', itemName: detail.item.name };
  }
  if (detail.held_item) {
    return { kind: 'item', itemName: detail.held_item.name };
  }
  if (detail.trigger.name === 'level-up' && detail.min_level) {
    return { kind: 'level', level: detail.min_level };
  }
  if (detail.trigger.name === 'trade') {
    return { kind: 'icon', icon: 'swap_horiz' };
  }
  if (detail.min_happiness) {
    return { kind: 'icon', icon: 'favorite' };
  }
  if (detail.min_affection) {
    return { kind: 'icon', icon: 'favorite' };
  }
  if (detail.min_beauty) {
    return { kind: 'icon', icon: 'auto_awesome' };
  }
  if (detail.time_of_day === 'day') {
    return { kind: 'icon', icon: 'wb_sunny' };
  }
  if (detail.time_of_day === 'night') {
    return { kind: 'icon', icon: 'nights_stay' };
  }
  if (detail.known_move || detail.known_move_type) {
    return { kind: 'icon', icon: 'bolt' };
  }
  if (detail.location) {
    return { kind: 'icon', icon: 'place' };
  }
  if (detail.gender === 1) {
    return { kind: 'icon', icon: 'female' };
  }
  if (detail.gender === 2) {
    return { kind: 'icon', icon: 'male' };
  }
  if (detail.needs_overworld_rain) {
    return { kind: 'icon', icon: 'water_drop' };
  }

  switch (detail.trigger.name) {
    case 'trade':
      return { kind: 'icon', icon: 'swap_horiz' };
    case 'shed':
      return { kind: 'icon', icon: 'content_copy' };
    case 'three-critical-hits':
    case 'take-damage':
    case 'recoil-damage':
      return { kind: 'icon', icon: 'whatshot' };
    case 'tower-of-darkness':
      return { kind: 'icon', icon: 'nights_stay' };
    case 'tower-of-waters':
      return { kind: 'icon', icon: 'water_drop' };
    case 'agile-style-move':
    case 'strong-style-move':
      return { kind: 'icon', icon: 'bolt' };
    case 'spin':
      return { kind: 'icon', icon: 'sync' };
    case 'event':
    case 'other':
      return { kind: 'icon', icon: 'help_outline' };
    case 'level-up':
      return { kind: 'icon', icon: 'trending_up' };
    default:
      return { kind: 'icon', icon: 'trending_up' };
  }
}
