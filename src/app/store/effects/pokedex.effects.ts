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
import {
  PokedexResponse,
  PokemonSpeciesDetails,
} from "../../models/pokedex.model";

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
              const detailRequests = response.results.map((pokemon) =>
                this.http.get<PokemonSpeciesDetails>(pokemon.url)
              );
              return forkJoin(detailRequests).pipe(
                map((details) =>
                  loadPokedexSuccess({
                    pokedex: response.results.map((result, index) => ({
                      ...result,
                      details: details[index],
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
