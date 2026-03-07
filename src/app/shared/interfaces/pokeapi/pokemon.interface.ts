/**
 * Pokemon-related PokeAPI interfaces
 */

import { Description, FlavorText, Name, NamedAPIResource, VerboseEffect } from './common.interface';

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: PokemonAbility[];
  forms: NamedAPIResource[];
  game_indices: VersionGameIndex[];
  held_items: PokemonHeldItem[];
  location_area_encounters: string;
  moves: PokemonMove[];
  species: NamedAPIResource;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  past_types: PokemonTypePast[];
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface VersionGameIndex {
  game_index: number;
  version: NamedAPIResource;
}

export interface PokemonHeldItem {
  item: NamedAPIResource;
  version_details: PokemonHeldItemVersion[];
}

export interface PokemonHeldItemVersion {
  version: NamedAPIResource;
  rarity: number;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonMoveVersion {
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
  level_learned_at: number;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other?: {
    dream_world?: {
      front_default: string | null;
      front_female: string | null;
    };
    home?: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    showdown?: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
      back_default: string | null;
      back_female: string | null;
      back_shiny: string | null;
      back_shiny_female: string | null;
    };
  };
  versions?: Record<string, Record<string, PokemonSprites>>;
}

export interface PokemonStat {
  stat: NamedAPIResource;
  effort: number;
  base_stat: number;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonTypePast {
  generation: NamedAPIResource;
  types: PokemonType[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: PokemonSpeciesDexEntry[];
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: APIResource;
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  names: Name[];
  flavor_text_entries: FlavorText[];
  form_descriptions: Description[];
  genera: Genus[];
  varieties: PokemonSpeciesVariety[];
}

export interface APIResource {
  url: string;
}

export interface PokemonSpeciesDexEntry {
  entry_number: number;
  pokedex: NamedAPIResource;
}

export interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: Name[];
  effect_entries: VerboseEffect[];
  effect_changes: AbilityEffectChange[];
  flavor_text_entries: AbilityFlavorText[];
  pokemon: AbilityPokemon[];
}

export interface AbilityEffectChange {
  effect_entries: {
    effect: string;
    language: NamedAPIResource;
  }[];
  version_group: NamedAPIResource;
}

export interface AbilityFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface AbilityPokemon {
  is_hidden: boolean;
  slot: number;
  pokemon: NamedAPIResource;
}

export interface Type {
  id: number;
  name: string;
  damage_relations: TypeRelations;
  past_damage_relations: TypeRelationsPast[];
  game_indices: GenerationGameIndex[];
  generation: NamedAPIResource;
  move_damage_class: NamedAPIResource | null;
  names: Name[];
  pokemon: TypePokemon[];
  moves: NamedAPIResource[];
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

export interface TypeRelationsPast {
  generation: NamedAPIResource;
  damage_relations: TypeRelations;
}

export interface GenerationGameIndex {
  game_index: number;
  generation: NamedAPIResource;
}

export interface TypePokemon {
  slot: number;
  pokemon: NamedAPIResource;
}

export interface Stat {
  id: number;
  name: string;
  game_index: number;
  is_battle_only: boolean;
  affecting_moves: MoveStatAffectSets;
  affecting_natures: NatureStatAffectSets;
  characteristics: APIResource[];
  move_damage_class: NamedAPIResource | null;
  names: Name[];
}

export interface MoveStatAffectSets {
  increase: MoveStatAffect[];
  decrease: MoveStatAffect[];
}

export interface MoveStatAffect {
  change: number;
  move: NamedAPIResource;
}

export interface NatureStatAffectSets {
  increase: NamedAPIResource[];
  decrease: NamedAPIResource[];
}

export interface EvolutionChain {
  id: number;
  baby_trigger_item: NamedAPIResource | null;
  chain: ChainLink;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionDetail {
  item: NamedAPIResource | null;
  trigger: NamedAPIResource;
  gender: number | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
}
