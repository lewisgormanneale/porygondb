import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  from,
  mergeMap,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { PokemonEntry, PokemonSpecies } from "pokenode-ts";
import {
  removeAllEntities,
  setEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { PageEvent } from "@angular/material/paginator";
import { withPagination } from "../../../shared/store/features/pagination.feature";
import {
  setCompleted,
  setError,
  setLoading,
  withRequestStatus,
} from "../../../shared/store/features/request-status.feature";
import { PokemonService } from "../../../shared/services/pokemon.service";

interface PokedexEntriesStoreState {
  pokedexEntries: PokemonEntry[];
}

const initialState: PokedexEntriesStoreState = {
  pokedexEntries: [],
};

export const PokedexEntriesStore = signalStore(
  withState(initialState),
  withEntities<PokemonSpecies>(),
  withPagination(),
  withRequestStatus(),
  withComputed((store) => ({
    paginatedPokemonEntries: computed(() => {
      const pageSize = store.pageEvent().pageSize;
      const pageIndex = store.pageEvent().pageIndex;
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      return store.pokedexEntries().slice(startIndex, endIndex);
    }),
  })),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    setPokedexEntries(pokedexEntries: PokemonEntry[]) {
      patchState(store, { pokedexEntries });
    },
    loadPokemonSpecies: rxMethod<PageEvent | undefined>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((pageEvent?: PageEvent) => {
          patchState(store, {
            pageEvent: {
              pageIndex: pageEvent?.pageIndex ? pageEvent.pageIndex : 0,
              pageSize: pageEvent?.pageSize ? pageEvent.pageSize : 50,
              length: store.pokedexEntries().length,
            },
          });
          const paginatedEntries = store.paginatedPokemonEntries();
          patchState(store, removeAllEntities());
          return from(paginatedEntries).pipe(
            mergeMap(
              (entry: PokemonEntry) =>
                pokemonService
                  .getPokemonSpeciesByName(entry.pokemon_species.name)
                  .pipe(
                    tapResponse({
                      next: (species: PokemonSpecies) => {
                        const index = paginatedEntries.findIndex(
                          (e) =>
                            e.pokemon_species.name ===
                            entry.pokemon_species.name
                        );
                        const orderedEntities = store.entities();
                        orderedEntities[index] = species;
                        patchState(store, setEntities(orderedEntities));
                      },
                      error: (error: Error) => {
                        patchState(store, setError(error.message));
                      },
                    })
                  ),
              5
            ),
            finalize(() => {
              patchState(store, setCompleted());
            })
          );
        })
      )
    ),
  }))
);

export type PokedexEntriesStore = InstanceType<typeof PokedexEntriesStore>;
