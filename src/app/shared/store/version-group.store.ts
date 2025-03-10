import { inject } from "@angular/core";
import { patchState, signalStore, withHooks, withMethods } from "@ngrx/signals";
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
  NamedAPIResource,
  NamedAPIResourceList,
  VersionGroup,
} from "pokenode-ts";
import {
  addEntities,
  removeAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { GameService } from "../services/game.service";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "./features/request-status.feature";
import { withSelectedEntity } from "./features/selected-entity.feature";

export const VersionGroupStore = signalStore(
  withEntities<VersionGroup>(),
  withSelectedEntity(),
  withRequestStatus(),
  withMethods((store, gameService = inject(GameService)) => ({
    listVersionGroups: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          return gameService.listVersionGroups().pipe(
            tap(() => patchState(store, setLoading())),
            switchMap((response: NamedAPIResourceList) => {
              const versionGroupRequests = response.results.map(
                (versionGroup: NamedAPIResource) =>
                  gameService.getVersionGroupByName(versionGroup.name)
              );
              return forkJoin(versionGroupRequests).pipe(
                tapResponse({
                  next: (versionGroups: VersionGroup[]) => {
                    patchState(store, removeAllEntities());
                    patchState(store, addEntities(versionGroups));
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
      store.listVersionGroups();
    },
  })
);
