import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  loadPokemon,
  loadPokemonFailure,
  loadPokemonSuccess,
} from '../actions/pokemon.actions';
import { PokemonClient } from 'pokenode-ts';

@Injectable()
export class PokemonEffects {
  pokeApi = new PokemonClient();
  loadPokemon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPokemon),
      mergeMap((action) =>
        from(this.pokeApi.getPokemonSpeciesByName(action.name)).pipe(
          mergeMap((speciesDetails) => {
            const varietyDetailRequests = speciesDetails.varieties.map(
              (pokemon) => this.pokeApi.getPokemonByName(pokemon.pokemon.name)
            );
            return forkJoin(varietyDetailRequests).pipe(
              map((varietyDetails) =>
                loadPokemonSuccess({
                  pokemon: {
                    url: speciesDetails.varieties[0].pokemon.url,
                    name: action.name,
                    speciesDetails,
                    varietyDetails,
                  },
                })
              ),
              catchError((error) => of(loadPokemonFailure({ error })))
            );
          }),
          catchError((error) => of(loadPokemonFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
