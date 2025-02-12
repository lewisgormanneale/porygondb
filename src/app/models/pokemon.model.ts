import { Pokemon, PokemonSpecies } from "pokenode-ts";

export interface PokemonResult {
  name: string;
  url: string;
  speciesDetails?: PokemonSpecies;
  varietyDetails?: Pokemon[];
}
