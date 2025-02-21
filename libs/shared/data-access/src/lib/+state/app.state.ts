import { ActionReducerMap } from '@ngrx/store';
import { pokedexReducer, PokedexState } from './reducers/pokedex.reducer';
import { pokemonReducer, PokemonState } from './reducers/pokemon.reducer';

export interface AppState {
  pokedex: PokedexState;
  pokemon: PokemonState;
}

export const appReducers: ActionReducerMap<AppState> = {
  pokedex: pokedexReducer,
  pokemon: pokemonReducer,
};
