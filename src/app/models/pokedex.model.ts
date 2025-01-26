export interface PokedexResponse {
  count: number;
  next: string;
  previous: string | null;
  results: PokedexResult[];
}

export interface PokedexResult {
  name: string;
  url: string;
  details?: PokemonSpeciesDetails;
}

export interface PokemonSpeciesDetails {
  id: number;
  name: string;
  names: PokemonSpeciesName[];
}

export interface PokemonSpeciesName {
  name: string;
  url: string;
}
