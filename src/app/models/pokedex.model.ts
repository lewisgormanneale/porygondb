import { PokemonSpeciesDetails } from "./pokemon.model";

export interface PokedexResult {
  name: string;
  url: string;
  speciesDetails?: PokemonSpeciesDetails;
}

export interface PokedexResponse {
  count: number;
  next: string;
  previous: string | null;
  results: PokedexResult[];
}
