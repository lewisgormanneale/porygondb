import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  ChainLink,
  EvolutionChain,
  FlavorText,
  Pokemon,
  PokemonForm,
  PokemonSpecies,
} from '../interfaces/pokeapi';
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
  selectedFormDetails: PokemonForm | null;
};

const initialState: PokemonState = {
  speciesDetails: {} as PokemonSpecies,
  evolutionChain: null,
  selectedFormDetails: null,
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
        store.selectedEntity()?.stats?.reduce<Record<string, number>>((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {}) || {}
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
    selectedPokemonDisplayName: computed(() => {
      const selectedPokemon = store.selectedEntity();
      const englishSpeciesName = store
        .speciesDetails()
        .names?.find((entry) => entry.language.name === 'en')?.name;
      const selectedFormDetails = store.selectedFormDetails();

      if (!selectedFormDetails) {
        if (selectedPokemon?.is_default) {
          return englishSpeciesName || store.speciesDetails().name || selectedPokemon.name || '';
        }

        return '';
      }

      const englishDisplayName = selectedFormDetails?.names.find(
        (entry) => entry.language.name === 'en'
      )?.name;
      const englishFormName = selectedFormDetails?.form_names.find(
        (entry) => entry.language.name === 'en'
      )?.name;

      if (englishDisplayName?.trim()) {
        return englishDisplayName;
      }

      if (englishFormName?.trim()) {
        return englishFormName;
      }

      if (selectedFormDetails?.form_name?.trim()) {
        return selectedFormDetails.form_name;
      }

      if (selectedPokemon?.is_default) {
        return englishSpeciesName || store.speciesDetails().name || selectedPokemon.name || '';
      }

      return '';
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
  withMethods((store, pokemonService = inject(PokemonService)) => {
    const loadPokemonFormDetails = rxMethod<string | null>(
      pipe(
        switchMap((formName) => {
          if (!formName) {
            return of(null);
          }

          return pokemonService.getPokemonFormByName(formName).pipe(catchError(() => of(null)));
        }),
        tap((selectedFormDetails) => {
          patchState(store, { selectedFormDetails });
        })
      )
    );

    return {
      setSelectedPokemonVariety(varietyId: number) {
        store.setSelectedId(varietyId);
        const selectedPokemon = store.selectedEntity();
        const primaryFormName = selectedPokemon?.forms[0]?.name ?? selectedPokemon?.name ?? null;

        loadPokemonFormDetails(primaryFormName);
      },
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
                        { speciesDetails, evolutionChain, selectedFormDetails: null },
                        setAllEntities(varietyDetails)
                      );
                      const defaultVarietyId = varietyDetails[0]?.id;

                      if (defaultVarietyId !== undefined) {
                        store.setSelectedId(defaultVarietyId);
                        const defaultVariety = store.selectedEntity();
                        const defaultFormName =
                          defaultVariety?.forms[0]?.name ?? defaultVariety?.name ?? null;
                        loadPokemonFormDetails(defaultFormName);
                      }
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
    };
  })
);

export type PokemonStore = InstanceType<typeof PokemonStore>;
