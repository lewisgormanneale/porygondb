import type { EvolutionDetail } from '../../../shared/interfaces/pokeapi';
import {
  dedupeEvolutionDetails,
  formatEvolutionDetail,
  formatEvolutionDetails,
  getEvolutionMethodVisual,
} from './format-evolution-detail.util';

function buildDetail(overrides: Partial<EvolutionDetail> = {}): EvolutionDetail {
  return {
    item: null,
    trigger: { name: 'level-up', url: 'https://pokeapi.co/api/v2/evolution-trigger/1/' },
    gender: null,
    held_item: null,
    known_move: null,
    known_move_type: null,
    location: null,
    min_level: null,
    min_happiness: null,
    min_beauty: null,
    min_affection: null,
    needs_overworld_rain: false,
    party_species: null,
    party_type: null,
    relative_physical_stats: null,
    time_of_day: '',
    trade_species: null,
    turn_upside_down: false,
    ...overrides,
  };
}

describe('formatEvolutionDetail', () => {
  it('formats a plain level-up evolution', () => {
    expect(formatEvolutionDetail(buildDetail({ min_level: 16 }))).toBe('Level 16');
  });

  it('formats a level-up evolution with no minimum level', () => {
    expect(formatEvolutionDetail(buildDetail())).toBe('Level up');
  });

  it('formats an item-triggered evolution', () => {
    const detail = buildDetail({
      trigger: { name: 'use-item', url: 'https://pokeapi.co/api/v2/evolution-trigger/3/' },
      item: { name: 'water-stone', url: 'https://pokeapi.co/api/v2/item/84/' },
    });

    expect(formatEvolutionDetail(detail)).toBe('Use Water Stone');
  });

  it('formats a trade evolution holding an item', () => {
    const detail = buildDetail({
      trigger: { name: 'trade', url: 'https://pokeapi.co/api/v2/evolution-trigger/2/' },
      held_item: { name: 'kings-rock', url: 'https://pokeapi.co/api/v2/item/154/' },
    });

    expect(formatEvolutionDetail(detail)).toBe('Trade, holding Kings Rock');
  });

  it('combines level, time of day, and known move', () => {
    const detail = buildDetail({
      min_level: 30,
      time_of_day: 'night',
      known_move: { name: 'rollout', url: 'https://pokeapi.co/api/v2/move/205/' },
    });

    expect(formatEvolutionDetail(detail)).toBe('Level 30, knowing Rollout, during the night');
  });

  it('includes friendship and gender conditions', () => {
    const detail = buildDetail({ min_happiness: 220, gender: 1 });

    expect(formatEvolutionDetail(detail)).toBe('Level up, with high friendship, female only');
  });

  it('formats multiple alternative details', () => {
    const details = [
      buildDetail({ min_level: 20 }),
      buildDetail({
        trigger: { name: 'use-item', url: 'https://pokeapi.co/api/v2/evolution-trigger/3/' },
        item: { name: 'moon-stone', url: 'https://pokeapi.co/api/v2/item/81/' },
      }),
    ];

    expect(formatEvolutionDetails(details)).toEqual(['Level 20', 'Use Moon Stone']);
  });
});

describe('dedupeEvolutionDetails', () => {
  it('collapses entries that format to identical text', () => {
    const thunderStone = buildDetail({
      trigger: { name: 'use-item', url: 'https://pokeapi.co/api/v2/evolution-trigger/3/' },
      item: { name: 'thunder-stone', url: 'https://pokeapi.co/api/v2/item/83/' },
    });

    const details = [thunderStone, { ...thunderStone }];

    expect(dedupeEvolutionDetails(details)).toEqual([thunderStone]);
  });

  it('keeps distinct entries', () => {
    const details = [
      buildDetail({ min_level: 20 }),
      buildDetail({
        trigger: { name: 'use-item', url: 'https://pokeapi.co/api/v2/evolution-trigger/3/' },
        item: { name: 'moon-stone', url: 'https://pokeapi.co/api/v2/item/81/' },
      }),
    ];

    expect(dedupeEvolutionDetails(details)).toEqual(details);
  });
});

describe('getEvolutionMethodVisual', () => {
  it('represents an item-triggered evolution with the item sprite', () => {
    const detail = buildDetail({
      trigger: { name: 'use-item', url: 'https://pokeapi.co/api/v2/evolution-trigger/3/' },
      item: { name: 'water-stone', url: 'https://pokeapi.co/api/v2/item/84/' },
    });

    expect(getEvolutionMethodVisual(detail)).toEqual({ kind: 'item', itemName: 'water-stone' });
  });

  it('represents a held-item evolution with the item sprite', () => {
    const detail = buildDetail({
      trigger: { name: 'trade', url: 'https://pokeapi.co/api/v2/evolution-trigger/2/' },
      held_item: { name: 'kings-rock', url: 'https://pokeapi.co/api/v2/item/154/' },
    });

    expect(getEvolutionMethodVisual(detail)).toEqual({ kind: 'item', itemName: 'kings-rock' });
  });

  it('represents a friendship evolution with a heart icon', () => {
    const detail = buildDetail({ min_happiness: 220 });

    expect(getEvolutionMethodVisual(detail)).toEqual({ kind: 'icon', icon: 'favorite' });
  });

  it('represents a trade evolution with a swap icon', () => {
    const detail = buildDetail({
      trigger: { name: 'trade', url: 'https://pokeapi.co/api/v2/evolution-trigger/2/' },
    });

    expect(getEvolutionMethodVisual(detail)).toEqual({ kind: 'icon', icon: 'swap_horiz' });
  });

  it('represents a level-up evolution with the level number', () => {
    expect(getEvolutionMethodVisual(buildDetail({ min_level: 16 }))).toEqual({
      kind: 'level',
      level: 16,
    });
  });

  it('falls back to a level icon for a level-up evolution with no minimum level', () => {
    expect(getEvolutionMethodVisual(buildDetail())).toEqual({
      kind: 'icon',
      icon: 'trending_up',
    });
  });

  it('prioritizes the level number over a known-move condition', () => {
    const detail = buildDetail({
      min_level: 30,
      known_move: { name: 'rollout', url: 'https://pokeapi.co/api/v2/move/205/' },
    });

    expect(getEvolutionMethodVisual(detail)).toEqual({ kind: 'level', level: 30 });
  });
});
