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
import { NamedAPIResource, NamedAPIResourceList, Pokedex } from "pokenode-ts";
import { withEntities, addEntities, setEntity } from "@ngrx/signals/entities";
import { GameService } from "../services/game.service";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "./features/request-status.feature";
import { withSelectedEntity } from "./features/selected-entity.feature";

export const PokedexStore = signalStore(
  { providedIn: "root" },
  withEntities<Pokedex>(),
  withSelectedEntity(),
  withRequestStatus(),
  withComputed(({ selectedEntity }) => ({
    pokemonEntriesForSelectedPokedex: computed(
      () => selectedEntity()?.pokemon_entries || []
    ),
  })),
  withMethods((store, gameService = inject(GameService)) => ({
    loadAllPokedexes: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap(() => {
          return gameService.listPokedexes().pipe(
            switchMap((response: NamedAPIResourceList) => {
              const pokedexDetailRequests = response.results.map(
                (pokedex: NamedAPIResource) =>
                  gameService.getPokedexByName(pokedex.name)
              );
              return forkJoin(pokedexDetailRequests).pipe(
                tapResponse({
                  next: (pokedexes) => {
                    patchState(store, addEntities(pokedexes));
                    const selectedPokedexId = store.selectedEntityId();
                    if (selectedPokedexId === null) {
                      store.setSelectedId(1);
                    }
                  },
                  error: (error: Error) =>
                    patchState(store, setError(error.message)),
                  finalize: () => patchState(store, setCompleted()),
                })
              );
            })
          );
        })
      )
    ),
    loadPokedexByName: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((name) => {
          return gameService.getPokedexByName(name).pipe(
            tapResponse({
              next: (pokedex) => {
                patchState(store, setEntity(pokedex));
                store.setSelectedId(pokedex.id);
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

export type PokedexStore = InstanceType<typeof PokedexStore>;
