import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
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
import { NamedAPIResource, NamedAPIResourceList, Pokedex } from 'pokenode-ts';
import { GameService } from '../services/game.service';

type PokedexState = {
  pokedexes: Pokedex[];
  isLoading: boolean;
  _selectedPokedexId: number | null;
  _selectedPokedexName: string | null;
};

const initialState: PokedexState = {
  pokedexes: [],
  isLoading: false,
  _selectedPokedexId: null,
  _selectedPokedexName: null,
};

export const PokedexStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    activePokedex: computed(() => {
      if (store._selectedPokedexId() !== null) {
        return store
          .pokedexes()
          .find(
            (pokedex: Pokedex) => pokedex.id === store._selectedPokedexId()
          );
      }
      if (store._selectedPokedexName() !== null) {
        return store
          .pokedexes()
          .find(
            (pokedex: Pokedex) => pokedex.name === store._selectedPokedexName()
          );
      }
      return null;
    }),
  })),
  withMethods((store, gameService = inject(GameService)) => ({
    listAllPokedexes: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
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
                    console.log(pokedexes);
                    patchState(store, {
                      pokedexes,
                      isLoading: false,
                    });
                  },
                  error: (err) => {
                    patchState(store, { isLoading: false });
                    console.error(err);
                  },
                })
              );
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              console.error(err);
              return of();
            })
          );
        })
      )
    ),
    selectPokedexById: (id: number) => {
      patchState(store, { _selectedPokedexId: id, _selectedPokedexName: null });
    },
    selectPokedexByName: (name: string) => {
      patchState(store, {
        _selectedPokedexName: name,
        _selectedPokedexId: null,
      });
    },
  }))
);
