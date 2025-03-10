import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from "@ngrx/signals";
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
import { NamedAPIResource, NamedAPIResourceList, Version } from "pokenode-ts";
import {
  addEntities,
  removeAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { withSelectedEntity } from "./features/selected-entity.feature";
import { GameService } from "../services/game.service";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "./features/request-status.feature";

export const VersionStore = signalStore(
  withEntities<Version>(),
  withSelectedEntity(),
  withRequestStatus(),
  withComputed((store) => ({
    groupedByVersionGroup: computed(() => {
      const entities = store.entities();
      const grouped = Object.values(entities).reduce(
        (acc: { [key: string]: Version[] }, version) => {
          if (!acc[version.version_group.name]) {
            acc[version.version_group.name] = [];
          }
          acc[version.version_group.name].push(version);
          return acc;
        },
        {}
      );
      return Object.keys(grouped).map((key) => ({
        versionGroupName: key,
        versions: grouped[key],
      }));
    }),
  })),
  withMethods((store, gameService = inject(GameService)) => ({
    listVersions: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          return gameService.listVersions().pipe(
            tap(() => patchState(store, setLoading())),
            switchMap((response: NamedAPIResourceList) => {
              const versionRequests = response.results.map(
                (version: NamedAPIResource) =>
                  gameService.getVersionByName(version.name)
              );
              return forkJoin(versionRequests).pipe(
                tapResponse({
                  next: (versions: Version[]) => {
                    patchState(store, removeAllEntities());
                    patchState(store, addEntities(versions));
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
      store.listVersions();
    },
  })
);
