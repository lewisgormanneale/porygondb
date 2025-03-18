import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { Move, PokemonMove } from "pokenode-ts";
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
import { PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MoveService } from "../services/move.service";
import { withPagination } from "./features/pagination.feature";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "./features/request-status.feature";

type MoveState = {
  pokemonMoves: PokemonMove[];
  paginatedMoves: Move[];
};

const initialState: MoveState = {
  pokemonMoves: [],
  paginatedMoves: [],
};

export const MoveStore = signalStore(
  withState(initialState),
  withPagination(),
  withComputed((store) => ({
    paginatedPokemonMoves: computed(() => {
      const pageSize = store.pageEvent().pageSize;
      const pageIndex = store.pageEvent().pageIndex;
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      return store.pokemonMoves().slice(startIndex, endIndex);
    }),
  })),
  withComputed(({ paginatedMoves }) => ({
    selectedPokemonMovesDataSource: computed(() => {
      return new MatTableDataSource<Move>(paginatedMoves());
    }),
  })),
  withRequestStatus(),
  withMethods((store, moveService = inject(MoveService)) => ({
    setPokemonMoves: (pokemonMoves: PokemonMove[]) => {
      patchState(store, { pokemonMoves });
    },
    loadMovesForPaginatedPokemonMoves: rxMethod<PageEvent | undefined>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((pageEvent?: PageEvent) => {
          patchState(store, {
            pageEvent: {
              pageIndex: pageEvent?.pageIndex ? pageEvent.pageIndex : 0,
              pageSize: pageEvent?.pageSize ? pageEvent.pageSize : 10,
              length: store.pokemonMoves().length,
            },
          });
          const paginatedPokemonMoves = store.paginatedPokemonMoves();
          const moveRequests = paginatedPokemonMoves.map((move: PokemonMove) =>
            moveService.getMoveByName(move.move.name)
          );
          return forkJoin(moveRequests).pipe(
            tapResponse({
              next: (paginatedMoves: Move[]) => {
                patchState(store, { paginatedMoves });
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
