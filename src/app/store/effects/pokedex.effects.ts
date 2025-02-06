import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { forkJoin, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import {
  loadPokedex,
  loadPokedexFailure,
  loadPokedexSuccess,
} from "../actions/pokedex.actions";
import { PokedexResponse } from "../../models/pokedex.model";
import { PokemonSpeciesDetails } from "src/app/models/pokemon.model";

@Injectable()
export class PokedexEffects {
  loadPokedex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPokedex),
      mergeMap((action) =>
        this.http
          .get<PokedexResponse>(
            `https://pokeapi.co/api/v2/pokemon-species?offset=${action.offset}&limit=${action.limit}`
          )
          .pipe(
            mergeMap((response) => {
              const speciesDetailRequests = response.results.map((pokemon) =>
                this.http.get<PokemonSpeciesDetails>(pokemon.url)
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

  constructor(private actions$: Actions, private http: HttpClient) {}
}
