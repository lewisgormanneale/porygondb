import { PokemonSpecies } from 'pokenode-ts';

export interface PokedexResult {
  name: string;
  url: string;
  speciesDetails: PokemonSpecies;
}
