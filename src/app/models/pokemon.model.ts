import { PokeApiLanguage } from "./pokeapi.model";

export interface PokemonResult {
  name: string;
  url: string;
  speciesDetails?: PokemonSpeciesDetails;
  varietyDetails?: PokemonDetails[];
}

export interface PokemonSpeciesDetails {
  id: number;
  name: string;
  names: PokemonSpeciesName[];
  varieties: PokemonSpeciesVariety[];
}

export interface PokemonSpeciesName {
  name: string;
  language: PokeApiLanguage;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: PokemonResult;
}

export interface PokemonDetails {
  id: number;
  name: string;
}
