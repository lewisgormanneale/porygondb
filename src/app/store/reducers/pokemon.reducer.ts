import { createReducer, on } from "@ngrx/store";
import { PokemonResult } from "src/app/models/pokemon.model";
import {
  loadPokemon,
  loadPokemonFailure,
  loadPokemonSuccess,
} from "../actions/pokemon.actions";

export interface PokemonState {
  pokemon: PokemonResult;
  loading: boolean;
  error: any;
}

export const initialState: PokemonState = {
  pokemon: {} as PokemonResult,
  loading: false,
  error: null,
};

export const pokemonReducer = createReducer(
  initialState,
  on(loadPokemon, (state) => ({ ...state, loading: true })),
  on(loadPokemonSuccess, (state, { pokemon }) => ({
    ...state,
    loading: false,
    pokemon,
  })),
  on(loadPokemonFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
