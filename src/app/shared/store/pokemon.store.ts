import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Pokemon, PokemonSpecies } from "pokenode-ts";
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
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { PokemonService } from "../services/pokemon.service";
import {
  withRequestStatus,
  setLoading,
  setError,
  setCompleted,
} from "./features/request-status.feature";
import { withSelectedEntity } from "./features/selected-entity.feature";

type PokemonState = {
  speciesDetails: PokemonSpecies;
};

const initialState: PokemonState = {
  speciesDetails: {} as PokemonSpecies,
};

export const PokemonStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withRequestStatus(),
  withEntities<Pokemon>(),
  withSelectedEntity(),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    loadPokemonByName: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((name) => {
          return pokemonService.getPokemonSpeciesByName(name).pipe(
            switchMap((speciesDetails) => {
              const varietyDetailRequests = speciesDetails.varieties.map(
                (pokemon) =>
                  pokemonService.getPokemonByName(pokemon.pokemon.name)
              );
              return forkJoin(varietyDetailRequests).pipe(
                tapResponse({
                  next: (varietyDetails) => {
                    patchState(
                      store,
                      { speciesDetails },
                      setAllEntities(varietyDetails)
                    );
                    store.setSelectedId(varietyDetails[0].id);
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
  }))
);

export type PokemonStore = InstanceType<typeof PokemonStore>;
