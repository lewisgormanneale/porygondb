import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { forkJoin, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import {
  PokemonDetails,
  PokemonSpeciesDetails,
} from "src/app/models/pokemon.model";
import {
  loadPokemon,
  loadPokemonFailure,
  loadPokemonSuccess,
} from "../actions/pokemon.actions";

@Injectable()
export class PokemonEffects {
  loadPokemon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPokemon),
      mergeMap((action) =>
        this.http
          .get<PokemonSpeciesDetails>(
            `https://pokeapi.co/api/v2/pokemon-species/${action.name}`
          )
          .pipe(
            mergeMap((speciesDetails: PokemonSpeciesDetails) => {
              const varietyDetailRequests = speciesDetails.varieties.map(
                (pokemon) => this.http.get<PokemonDetails>(pokemon.pokemon.url)
              );
              return forkJoin(varietyDetailRequests).pipe(
                map((varietyDetails) =>
                  loadPokemonSuccess({
                    pokemon: {
                      url: speciesDetails.varieties[0].pokemon.url,
                      name: "hi",
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

  constructor(private actions$: Actions, private http: HttpClient) {}
}
