import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { Pokedex } from "pokenode-ts";
import { setEntity, withEntities } from "@ngrx/signals/entities";
import { GameService } from "../services/game.service";
import {
  setCompleted,
  setError,
  setLoading,
  withRequestStatus,
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
                console.log(store.selectedEntity());
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
