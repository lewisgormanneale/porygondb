import { inject } from '@angular/core';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  pipe,
  switchMap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { NamedAPIResource, NamedAPIResourceList, Pokedex } from 'pokenode-ts';
import { GameService } from '../services/game.service';
import { withEntities, addEntity } from '@ngrx/signals/entities';
import { withSelectedEntity } from './features/selected-entity.feature';
import { PokedexResult } from '../models/pokedex.model';
import { withPagination } from './features/pagination.feature';

export const PokedexStore = signalStore(
  withEntities<PokedexResult>(),
  withSelectedEntity(),
  withPagination(),
  // withComputed((store) => {
  //   const entities = store.entities();
  //   const activePokedex = computed(() => {
  //     if (store._selectedPokedexId() !== null) {
  //       return store
  //         .pokedexes()
  //         .find(
  //           (pokedex: Pokedex) => pokedex.id === store._selectedPokedexId()
  //         );
  //     }
  //     if (store._selectedPokedexName() !== null) {
  //       return store
  //         .pokedexes()
  //         .find(
  //           (pokedex: Pokedex) => pokedex.name === store._selectedPokedexName()
  //         );
  //     }
  //     return null;
  //   });

  //   return {
  //     activePokedex,
  //     totalPokedexEntriesCount: computed(() => {
  //       const activePokedexValue = activePokedex();
  //       return activePokedexValue
  //         ? activePokedexValue.pokemon_entries.length
  //         : 0;
  //     }),
  //     paginatedPokemonEntries: computed(() => {
  //       const activePokedexValue = activePokedex();
  //       if (!activePokedex) return [];
  //       const startIndex = store.pageIndex() * store.pageSize();
  //       const endIndex = startIndex + store.pageSize();
  //       return activePokedexValue
  //         ? activePokedexValue.pokemon_entries.slice(startIndex, endIndex)
  //         : [];
  //     }),
  //   };
  // }),
  withMethods((store, gameService = inject(GameService)) => ({
    listAllPokedexes: rxMethod<void>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
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
                    pokedexes.forEach((pokedex: Pokedex) => {
                      const pokedexResult: PokedexResult = {
                        id: pokedex.id,
                        pokedex,
                      };
                      patchState(store, addEntity(pokedexResult));
                    });
                    console.log('Pokedexes loaded', store.entities());
                    store.setSelectedId(1);
                  },
                  error: (err) => {
                    console.error(err);
                  },
                })
              );
            }),
            catchError((err) => {
              console.error(err);
              return of();
            })
          );
        })
      )
    ),
    // selectPokedexById: (id: number) => {
    //   patchState(store, { _selectedPokedexId: id, _selectedPokedexName: null });
    // },
    // selectPokedexByName: (name: string) => {
    //   patchState(store, {
    //     _selectedPokedexName: name,
    //     _selectedPokedexId: null,
    //   });
    // },
    // setPageSize: (size: number) => {
    //   patchState(store, { pageSize: size });
    // },
    // setPageIndex: (index: number) => {
    //   patchState(store, { pageIndex: index });
    // },
  }))
);
