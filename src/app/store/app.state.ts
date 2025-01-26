import { ActionReducerMap } from "@ngrx/store";
import { pokedexReducer, PokedexState } from "./reducers/pokedex.reducer";

export interface AppState {
  pokedex: PokedexState;
}

export const appReducers: ActionReducerMap<AppState> = {
  pokedex: pokedexReducer,
};
