import { signalStore, withState } from '@ngrx/signals';
import { PokemonResult } from '../models/pokemon.model';

type PokemonState = {
  pokemon: PokemonResult;
};

const initialState: PokemonState = {
  pokemon: {} as PokemonResult,
};
export const PokemonStore = signalStore(withState(initialState));
