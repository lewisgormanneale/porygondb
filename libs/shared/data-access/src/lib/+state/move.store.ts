import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Move, Pokemon, PokemonMove, PokemonSpecies } from 'pokenode-ts';
import { PokemonService } from '../services/pokemon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  setCompleted,
  setError,
  setLoading,
  withRequestStatus,
} from './features/request-status.feature';
import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  addEntities,
  removeAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { withSelectedEntity } from 'shared-utils';
import { MoveService } from '../services/move.service';
import { withPagination } from './features/pagination.feature';
import { PokemonStore } from './pokemon.store';
import { PageEvent } from '@angular/material/paginator';

export const MoveStore = signalStore(
  withEntities<Move>(),
  withSelectedEntity(),
  withPagination(),
  withComputed((store, pokemonStore = inject(PokemonStore)) => ({
    selectedPokemon: computed(() => pokemonStore.selectedEntity() || {}),
  })),
  withComputed((store) => ({
    paginatedMoves: computed(() => {
      const pageSize = store.pageEvent().pageSize;
      const pageIndex = store.pageEvent().pageIndex;
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      return store.selectedPokemon().moves.slice(startIndex, endIndex);
    }),
  })),
  withRequestStatus(),
  withMethods((store, moveService = inject(MoveService)) => ({
    loadMovesForSelectedPokemon: rxMethod<PageEvent | undefined>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((pageEvent?: PageEvent) => {
          patchState(store, {
            pageEvent: {
              pageIndex: pageEvent?.pageIndex ? pageEvent.pageIndex : 0,
              pageSize: pageEvent?.pageSize ? pageEvent.pageSize : 18,
              length: store.selectedPokemon().moves.length,
            },
          });
          console.log(store.selectedPokemon().moves.length);
          const paginatedMoves = store.paginatedMoves();
          const moveRequests = paginatedMoves.map((move: PokemonMove) =>
            moveService.getMoveByName(move.move.name)
          );
          patchState(store, removeAllEntities());
          return forkJoin(moveRequests).pipe(
            tapResponse({
              next: (moves: Move[]) => {
                patchState(store, addEntities(moves));
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

export type MoveStore = InstanceType<typeof MoveStore>;
