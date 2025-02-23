import { inject } from '@angular/core';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  pipe,
  switchMap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  NamedAPIResource,
  NamedAPIResourceList,
  PokemonSpecies,
} from 'pokenode-ts';
import { PokemonService, withPagination } from 'shared-data-access';
import { withSelectedEntity } from 'shared-utils';
import { addEntities, withEntities } from '@ngrx/signals/entities';

export const PokemonStore = signalStore(
  withEntities<PokemonSpecies>(),
  withSelectedEntity(),
  withPagination(),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    listAllPokemon: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          return pokemonService
            .listPokemonSpecies(
              store.pageEvent().pageSize,
              store.pageEvent().pageIndex
            )
            .pipe(
              switchMap((response: NamedAPIResourceList) => {
                const pokemonSpeciesRequests = response.results.map(
                  (pokemon: NamedAPIResource) =>
                    pokemonService.getPokemonSpeciesByName(pokemon.name)
                );
                return forkJoin(pokemonSpeciesRequests).pipe(
                  tapResponse({
                    next: (pokemonSpecies: PokemonSpecies[]) => {
                      console.log(pokemonSpecies);
                      patchState(store, addEntities(pokemonSpecies));
                    },
                    error: (err) => {
                      console.error(err);
                    },
                  })
                );
              }),
              catchError((err) => {
                console.error(err);
                return of();
              })
            );
        })
      )
    ),
  }))
);
