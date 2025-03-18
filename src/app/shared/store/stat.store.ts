import { inject } from "@angular/core";
import { patchState, signalStore, withHooks, withMethods } from "@ngrx/signals";
import { NamedAPIResource, NamedAPIResourceList, Stat } from "pokenode-ts";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  addEntities,
  removeAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { PokemonService } from "../services/pokemon.service";
import {
  setCompleted,
  setError,
  setLoading,
  withRequestStatus,
} from "./features/request-status.feature";

export const StatStore = signalStore(
  withRequestStatus(),
  withEntities<Stat>(),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    listStats: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          return pokemonService.listStats().pipe(
            tap(() => patchState(store, setLoading())),
            switchMap((response: NamedAPIResourceList) => {
              const statRequests = response.results.map(
                (stat: NamedAPIResource) =>
                  pokemonService.getStatByName(stat.name)
              );
              return forkJoin(statRequests).pipe(
                tapResponse({
                  next: (stats: Stat[]) => {
                    patchState(store, removeAllEntities());
                    patchState(store, addEntities(stats));
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
      store.listStats();
    },
  })
);

export type StatStore = InstanceType<typeof StatStore>;
