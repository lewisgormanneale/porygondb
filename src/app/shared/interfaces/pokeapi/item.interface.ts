/**
 * Item-related PokeAPI interfaces
 */

import { Description, Name, NamedAPIResource, VerboseEffect } from './common.interface';
import { APIResource, GenerationGameIndex } from './pokemon.interface';

export interface Item {
  id: number;
  name: string;
  fling_power: number | null;
  fling_effect: NamedAPIResource | null;
  attributes: NamedAPIResource[];
  category: NamedAPIResource;
  effect_entries: VerboseEffect[];
  flavor_text_entries: ItemFlavorText[];
  game_indices: GenerationGameIndex[];
  prices: ItemPrice[];
  names: Name[];
  sprites: ItemSprites;
  held_by_pokemon: ItemHolderPokemon[];
  baby_trigger_for: APIResource | null;
  machines: ItemMachineVersionDetail[];
}

export interface ItemPrice {
  purchase_price: number | null;
  sell_price: number | null;
  currency: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface ItemSprites {
  default: string | null;
}

export interface ItemFlavorText {
  text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface ItemHolderPokemon {
  pokemon: NamedAPIResource;
  version_details: ItemHolderPokemonVersionDetail[];
}

export interface ItemHolderPokemonVersionDetail {
  rarity: number;
  version: NamedAPIResource;
}

export interface ItemMachineVersionDetail {
  machine: APIResource;
  version_group: NamedAPIResource;
}

export interface ItemCategory {
  id: number;
  name: string;
  items: NamedAPIResource[];
  names: Name[];
  pocket: NamedAPIResource;
}

export interface ItemAttribute {
  id: number;
  name: string;
  items: NamedAPIResource[];
  names: Name[];
  descriptions: Description[];
}
