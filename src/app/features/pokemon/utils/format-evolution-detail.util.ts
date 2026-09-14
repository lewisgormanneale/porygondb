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
