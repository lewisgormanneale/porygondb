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
  url: string;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: PokemonResult;
}

export interface PokemonDetails {
  id: number;
  name: string;
  names: PokemonSpeciesName[];
}
