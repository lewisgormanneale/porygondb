import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {loadPokedex, loadPokedexFailure, loadPokedexSuccess} from '../actions/pokedex.actions';
import {PokedexResponse} from "../../models/pokedex.model";

@Injectable()
export class PokedexEffects {
    loadPokedex$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadPokedex),
            mergeMap((action) =>
                this.http.get<PokedexResponse>(`https://pokeapi.co/api/v2/pokemon?offset=${action.offset}&limit=${action.limit}`).pipe(
                    map(response => loadPokedexSuccess({pokedex: response.results})),
                    catchError(error => of(loadPokedexFailure({error})))
                )
            )
        )
    );

    constructor(private actions$: Actions, private http: HttpClient) {
    }
}