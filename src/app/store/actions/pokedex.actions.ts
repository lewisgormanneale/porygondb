import {createAction, props} from '@ngrx/store';
import {PokedexResult} from '../../models/pokedex.model';

export const loadPokedex = createAction('[Pokedex] Load Pokedex', props<{ offset: number, limit: number }>());
export const loadPokedexSuccess = createAction('[Pokedex] Load Pokedex Success', props<{
    pokedex: PokedexResult[],
    totalCount: number
}>());
export const loadPokedexFailure = createAction('[Pokedex] Load Pokedex Failure', props<{ error: any }>());