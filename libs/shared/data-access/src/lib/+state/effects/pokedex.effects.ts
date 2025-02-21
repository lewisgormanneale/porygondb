import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  loadPokedex,
  loadPokedexFailure,
  loadPokedexSuccess,
} from '../actions/pokedex.actions';
import { PokemonClient } from 'pokenode-ts';

@Injectable()
export class PokedexEffects {
  pokeApi = new PokemonClient();
  loadPokedex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPokedex),
      mergeMap((action) =>
        from(this.pokeApi.listPokemonSpecies(action.offset, action.limit)).pipe(
          mergeMap((response) => {
            const speciesDetailRequests = response.results.map((pokemon) =>
              this.pokeApi.getPokemonSpeciesByName(pokemon.name)
            );
            return forkJoin(speciesDetailRequests).pipe(
              map((speciesDetails) =>
                loadPokedexSuccess({
                  pokedex: response.results.map((result, index) => ({
                    ...result,
                    speciesDetails: speciesDetails[index],
                  })),
                  totalCount: response.count,
                })
              ),
              catchError((error) => of(loadPokedexFailure({ error })))
            );
          }),
          catchError((error) => of(loadPokedexFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
