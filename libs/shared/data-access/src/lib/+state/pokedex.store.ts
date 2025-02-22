import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { NamedAPIResource, NamedAPIResourceList, Pokedex } from 'pokenode-ts';
import { GameService } from '../services/game.service';
import { PokemonService } from '../services/pokemon.service';
import { withSelectedEntity } from 'shared-utils';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

type PokedexState = {
  pokedexes: Pokedex[];
  selectedPokedex: Pokedex | null;
  isLoading: boolean;
};

const initialState: PokedexState = {
  pokedexes: [],
  selectedPokedex: null,
  isLoading: false,
};

export const PokedexStore = signalStore(
  withState(initialState),
  withEntities<Pokedex>(),
  withSelectedEntity(),
  withMethods((store, gameService = inject(GameService)) => ({
    listAllPokedexes: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          return gameService.listPokedexes().pipe(
            switchMap((response: NamedAPIResourceList) => {
              console.log(response);
              const pokedexDetailRequests = response.results.map(
                (pokedex: NamedAPIResource) =>
                  gameService.getPokedexByName(pokedex.name)
              );
              return forkJoin(pokedexDetailRequests).pipe(
                tapResponse({
                  next: (pokedexDetails) => {
                    patchState(store, setAllEntities(pokedexDetails));
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
  }))
);
