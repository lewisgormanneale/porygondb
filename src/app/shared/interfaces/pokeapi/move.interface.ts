/**
 * Move-related PokeAPI interfaces
 */

import { Description, Name, NamedAPIResource, VerboseEffect } from './common.interface';
import { APIResource } from './pokemon.interface';

export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number | null;
  priority: number;
  power: number | null;
  contest_type: NamedAPIResource | null;
  contest_effect: APIResource | null;
  super_contest_effect: APIResource | null;
  damage_class: NamedAPIResource;
  effect_entries: VerboseEffect[];
  effect_changes: MoveEffectChange[];
  learned_by_pokemon: NamedAPIResource[];
  flavor_text_entries: MoveFlavorText[];
  generation: NamedAPIResource;
  machines: MoveMachineVersionDetail[];
  meta: MoveMetaData | null;
  names: Name[];
  stat_changes: MoveStatChange[];
  target: NamedAPIResource;
  type: NamedAPIResource;
}

export interface MoveEffectChange {
  effect_entries: {
    effect: string;
    language: NamedAPIResource;
  }[];
  version_group: NamedAPIResource;
}

export interface MoveFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface MoveMachineVersionDetail {
  machine: APIResource;
  version_group: NamedAPIResource;
}

export interface MoveMetaData {
  ailment: NamedAPIResource;
  category: NamedAPIResource;
  min_hits: number | null;
  max_hits: number | null;
  min_turns: number | null;
  max_turns: number | null;
  drain: number;
  healing: number;
  crit_rate: number;
  ailment_chance: number;
  flinch_chance: number;
  stat_chance: number;
}

export interface MoveStatChange {
  change: number;
  stat: NamedAPIResource;
}

export interface MoveDamageClass {
  id: number;
  name: string;
  descriptions: Description[];
  moves: NamedAPIResource[];
  names: Name[];
}
