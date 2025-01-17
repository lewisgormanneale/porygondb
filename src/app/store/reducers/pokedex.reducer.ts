import {createReducer, on} from '@ngrx/store';
import {loadPokedex, loadPokedexFailure, loadPokedexSuccess} from '../actions/pokedex.actions';
import {PokedexResult} from '../../models/pokedex.model';

export interface PokedexState {
    pokedex: PokedexResult[];
    loading: boolean;
    error: any;
}

export const initialState: PokedexState = {
    pokedex: [],
    loading: false,
    error: null
};

export const pokedexReducer = createReducer(
    initialState,
    on(loadPokedex, state => ({...state, loading: true})),
    on(loadPokedexSuccess, (state, {pokedex}) => ({...state, loading: false, pokedex})),
    on(loadPokedexFailure, (state, {error}) => ({...state, loading: false, error}))
);