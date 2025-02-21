import { createAction, props } from '@ngrx/store';
import { PokemonResult } from 'shared-data-access';

export const loadPokemon = createAction(
  '[Pokemon] Load Pokemon',
  props<{ name: string }>()
);
export const loadPokemonSuccess = createAction(
  '[Pokemon] Load  Success',
  props<{
    pokemon: PokemonResult;
  }>()
);
export const loadPokemonFailure = createAction(
  '[Pokemon] Load Pokemon Failure',
  props<{ error: any }>()
);
