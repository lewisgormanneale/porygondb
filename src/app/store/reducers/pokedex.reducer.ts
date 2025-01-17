import {createReducer, on} from '@ngrx/store';
import {loadPokedex, loadPokedexFailure, loadPokedexSuccess} from '../actions/pokedex.actions';
import {PokedexResult} from '../../models/pokedex.model';

export interface PokedexState {
    pokedex: PokedexResult[];
    totalCount: number;
    loading: boolean;
    error: any;
}

export const initialState: PokedexState = {
    pokedex: [],
    totalCount: 0,
    loading: false,
    error: null
};

export const pokedexReducer = createReducer(
    initialState,
    on(loadPokedex, state => ({...state, loading: true})),
    on(loadPokedexSuccess, (state, {pokedex, totalCount}) => ({
        ...state, loading: false, pokedex, totalCount
    })),
    on(loadPokedexFailure, (state, {error}) => ({...state, loading: false, error}))
);