import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { PokemonResult } from '../models/pokemon.model';
import { tapResponse } from '@ngrx/operators';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon, PokemonSpecies } from 'pokenode-ts';

type PokemonState = {
  pokemon: PokemonResult;
  isLoading: boolean;
};

const initialState: PokemonState = {
  pokemon: {} as PokemonResult,
  isLoading: false,
};

export const PokemonStore = signalStore(
  withState(initialState),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    loadByName: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((query) => {
          return pokemonService.getPokemonSpeciesByName(query).pipe(
            switchMap((speciesDetails: PokemonSpecies) => {
              const varietyDetailRequests = speciesDetails.varieties.map(
                (pokemon) =>
                  pokemonService.getPokemonByName(pokemon.pokemon.name)
              );
              return forkJoin(varietyDetailRequests).pipe(
                tapResponse({
                  next: (varietyDetails: Pokemon[]) => {
                    patchState(store, {
                      pokemon: {
                        name: query,
                        url: speciesDetails.varieties[0].pokemon.url,
                        speciesDetails,
                        varietyDetails,
                      },
                      isLoading: false,
                    });
                  },
                  error: (err) => {
                    patchState(store, { isLoading: false });
                    console.error(err);
                  },
                })
              );
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              console.error(err);
              return of();
            })
          );
        })
      )
    ),
  }))
);
