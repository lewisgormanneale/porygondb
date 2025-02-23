import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
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
import { tapResponse } from '@ngrx/operators';
import {
  NamedAPIResource,
  NamedAPIResourceList,
  PokemonSpecies,
} from 'pokenode-ts';
import { withSelectedEntity } from 'shared-utils';
import {
  addEntities,
  removeAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { PokemonService } from '../services/pokemon.service';
import { withPagination } from './features/pagination.feature';
import { PageEvent } from '@angular/material/paginator';
import {
  setCompleted,
  setError,
  setLoading,
  withRequestStatus,
} from './features/request-status.feature';

export const PokemonStore = signalStore(
  withEntities<PokemonSpecies>(),
  withSelectedEntity(),
  withPagination(),
  withRequestStatus(),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    listPokemonSpecies: rxMethod<PageEvent | undefined>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((pageEvent?: PageEvent) => {
          return pokemonService
            .listPokemonSpecies(store.offset(), store.limit())
            .pipe(
              tap(() => patchState(store, setLoading())),
              switchMap((response: NamedAPIResourceList) => {
                patchState(store, {
                  pageEvent: {
                    pageIndex: pageEvent?.pageIndex ? pageEvent.pageIndex : 0,
                    pageSize: pageEvent?.pageSize ? pageEvent.pageSize : 25,
                    length: response.count,
                  },
                });
                const pokemonSpeciesRequests = response.results.map(
                  (pokemon: NamedAPIResource) =>
                    pokemonService.getPokemonSpeciesByName(pokemon.name)
                );
                return forkJoin(pokemonSpeciesRequests).pipe(
                  tapResponse({
                    next: (pokemonSpecies: PokemonSpecies[]) => {
                      console.log(pokemonSpecies);
                      patchState(store, removeAllEntities());
                      patchState(store, addEntities(pokemonSpecies));
                    },
                    error: (error: Error) => {
                      patchState(store, setError(error.message));
                    },
                    finalize: () => patchState(store, setCompleted()),
                  })
                );
              }),
              catchError((error: Error) => {
                patchState(store, setError(error.message));
                return of();
              })
            );
        })
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.listPokemonSpecies(store.pageEvent());
    },
  })
);
