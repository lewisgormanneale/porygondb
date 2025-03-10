import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { PokemonEntry, PokemonSpecies } from "pokenode-ts";
import {
  withEntities,
  addEntities,
  removeAllEntities,
} from "@ngrx/signals/entities";
import { PageEvent } from "@angular/material/paginator";
import { PokemonService } from "src/app/shared/services/pokemon.service";
import { withPagination } from "src/app/shared/store/features/pagination.feature";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "src/app/shared/store/features/request-status.feature";
import { PokedexStore } from "src/app/shared/store/pokedex.store";

export const PokedexSpeciesListStore = signalStore(
  withEntities<PokemonSpecies>(),
  withPagination(),
  withRequestStatus(),
  withComputed((store, pokedexStore = inject(PokedexStore)) => ({
    selectedPokedex: computed(() => pokedexStore.selectedEntity() || {}),
    pokemonEntries: computed(
      () => pokedexStore.pokemonEntriesForSelectedPokedex() || []
    ),
  })),
  withComputed((store) => ({
    paginatedPokemonEntries: computed(() => {
      const pageSize = store.pageEvent().pageSize;
      const pageIndex = store.pageEvent().pageIndex;
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      return store.pokemonEntries().slice(startIndex, endIndex);
    }),
  })),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    loadPokemonSpecies: rxMethod<PageEvent | undefined>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((pageEvent?: PageEvent) => {
          patchState(store, {
            pageEvent: {
              pageIndex: pageEvent?.pageIndex ? pageEvent.pageIndex : 0,
              pageSize: pageEvent?.pageSize ? pageEvent.pageSize : 25,
              length: store.pokemonEntries().length,
            },
          });
          const paginatedEntries = store.paginatedPokemonEntries();
          const speciesRequests = paginatedEntries.map((entry: PokemonEntry) =>
            pokemonService.getPokemonSpeciesByName(entry.pokemon_species.name)
          );
          patchState(store, removeAllEntities());
          return forkJoin(speciesRequests).pipe(
            tapResponse({
              next: (species: PokemonSpecies[]) => {
                patchState(store, addEntities(species));
              },
              error: (error: Error) =>
                patchState(store, setError(error.message)),
              finalize: () => patchState(store, setCompleted()),
            })
          );
        })
      )
    ),
  }))
);
