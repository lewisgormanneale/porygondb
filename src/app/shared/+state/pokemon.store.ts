import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ChainLink, EvolutionChain, FlavorText, Pokemon, PokemonSpecies } from '../interfaces/pokeapi';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { PokemonService } from '../services/pokemon.service';
import {
    setCompleted,
    setError,
    setLoading,
    withRequestStatus,
} from './features/request-status.feature';
import { withSelectedEntity } from './features/selected-entity.feature';

type PokemonState = {
  speciesDetails: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
};

const initialState: PokemonState = {
  speciesDetails: {} as PokemonSpecies,
  evolutionChain: null,
};

export interface EvolutionStage {
  speciesName: string;
  speciesId: number;
}

export interface PokemonStatData {
  name: string;
  weight: number;
  symbol: string;
}

export const PokemonStore = signalStore(
  withState(initialState),
  withRequestStatus(),
  withEntities<Pokemon>(),
  withSelectedEntity(),
  withComputed((store) => ({
    selectedPokemonStats: computed(() => {
      return (
        store.selectedEntity()?.stats?.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {} as Record<string, number>) || {}
      );
    }),
    englishSpeciesDescription: computed(() => {
      return store
        .speciesDetails()
        .flavor_text_entries.find((entry: FlavorText) => entry.language.name === 'en');
    }),
    selectedPokemonHomeFrontSprite: computed(() => {
      return store.selectedEntity()?.sprites.other?.home?.front_default ?? '';
    }),
    evolutionLine: computed(() => {
      const chain = store.evolutionChain();
      if (!chain) return [];

      const stages: EvolutionStage[][] = [];

      const extractStages = (link: ChainLink, stageIndex: number) => {
        if (!stages[stageIndex]) stages[stageIndex] = [];
        const speciesId = parseInt(link.species.url.split('/').filter(Boolean).pop() || '0', 10);
        stages[stageIndex].push({
          speciesName: link.species.name,
          speciesId,
        });
        link.evolves_to.forEach((evo) => extractStages(evo, stageIndex + 1));
      };

      extractStages(chain.chain, 0);
      return stages;
    }),
  })),
  withMethods((store, pokemonService = inject(PokemonService)) => ({
    loadPokemonByName: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, setLoading())),
        switchMap((name) => {
          return pokemonService.getPokemonSpeciesByName(name).pipe(
            switchMap((speciesDetails) => {
              const varietyDetailRequests = speciesDetails.varieties.map((pokemon) =>
                pokemonService.getPokemonByName(pokemon.pokemon.name)
              );
              const evolutionChainRequest = pokemonService.getEvolutionChainByUrl(
                speciesDetails.evolution_chain.url
              );
              return forkJoin([forkJoin(varietyDetailRequests), evolutionChainRequest]).pipe(
                tapResponse({
                  next: ([varietyDetails, evolutionChain]) => {
                    patchState(
                      store,
                      { speciesDetails, evolutionChain },
                      setAllEntities(varietyDetails)
                    );
                    store.setSelectedId(varietyDetails[0].id);
                  },
                  error: (error: Error) => patchState(store, setError(error.message)),
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
