import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PokemonSummaryComponent } from '../../components/pokemon-summary/pokemon-summary.component';
import { PokemonStatsTabComponent } from '../../components/tabs/pokemon-stats-tab/pokemon-stats-tab.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonDetailsTabComponent } from '../../components/tabs/pokemon-details-tab/pokemon-details-tab.component';
import { EvolutionLineComponent } from '../../components/evolution-line/evolution-line.component';
import { PokemonAdditionalInfoComponent } from '../../components/pokemon-additional-info/pokemon-additional-info.component';
import { PokemonNavBarComponent } from '../../components/pokemon-nav-bar/pokemon-nav-bar.component';
import { GameService } from '../../../../shared/services/game.service';
import { PokemonEntry } from '../../../../shared/interfaces/pokeapi';
import { VersionGroups } from '../../../../shared/+state/data/version-group.constants';

interface PokemonVersionGroupOption {
  versionGroupName: string;
  versionGroupFormattedName: string;
  pokedexName: string;
  pokedexFormattedName: string;
}

@Component({
  imports: [
    MatProgressBarModule,
    MatTabsModule,
    RouterModule,
    PokemonSummaryComponent,
    PokemonStatsTabComponent,
    PokemonDetailsTabComponent,
    EvolutionLineComponent,
    PokemonAdditionalInfoComponent,
    PokemonNavBarComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
  selector: 'app-pokemon',
  templateUrl: 'pokemon.component.html',
  styleUrl: 'pokemon.component.scss',
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly gameService = inject(GameService);
  readonly destroyRef = inject(DestroyRef);
  readonly router = inject(Router);
  pokemonName = signal<string>('');
  versionGroupName = signal<string>('');
  pokedexName = signal<string>('');
  pokedexEntries = signal<PokemonEntry[]>([]);

  readonly availableVersionGroupOptions = computed<PokemonVersionGroupOption[]>(() => {
    const selectedPokemon = this.pokemonStore.selectedEntity();
    const speciesDetails = this.pokemonStore.speciesDetails();
    const currentVersionGroupName = this.versionGroupName();
    const currentPokedexName = this.pokedexName();

    if (!selectedPokemon?.moves?.length || !speciesDetails?.pokedex_numbers?.length) {
      if (!currentVersionGroupName || !currentPokedexName) {
        return [];
      }

      const currentVersionGroup = VersionGroups.find(
        (entry) => entry.name === currentVersionGroupName
      );
      const currentPokedex = currentVersionGroup?.pokedexes.find(
        (entry) => entry.name === currentPokedexName
      );

      if (!currentVersionGroup || !currentPokedex) {
        return [];
      }

      return [
        {
          versionGroupName: currentVersionGroup.name,
          versionGroupFormattedName: currentVersionGroup.formattedName,
          pokedexName: currentPokedex.name,
          pokedexFormattedName: currentPokedex.formattedName,
        },
      ];
    }

    const pokemonVersionGroupNames = new Set(
      selectedPokemon.moves.flatMap((move) =>
        move.version_group_details.map((detail) => detail.version_group.name)
      )
    );
    const pokemonPokedexNames = new Set(
      speciesDetails.pokedex_numbers.map((entry) => entry.pokedex.name)
    );

    const options = VersionGroups.filter((versionGroup) => pokemonVersionGroupNames.has(versionGroup.name))
      .map((versionGroup) => {
        const matchedPokedex = versionGroup.pokedexes.find((pokedex) =>
          pokemonPokedexNames.has(pokedex.name)
        );

        if (!matchedPokedex) {
          return null;
        }

        return {
          versionGroupName: versionGroup.name,
          versionGroupFormattedName: versionGroup.formattedName,
          pokedexName: matchedPokedex.name,
          pokedexFormattedName: matchedPokedex.formattedName,
        };
      })
      .filter((option): option is PokemonVersionGroupOption => option !== null);

    if (currentVersionGroupName && currentPokedexName) {
      const currentVersionGroup = VersionGroups.find(
        (entry) => entry.name === currentVersionGroupName
      );
      const currentPokedex = currentVersionGroup?.pokedexes.find(
        (entry) => entry.name === currentPokedexName
      );

      if (
        currentVersionGroup &&
        currentPokedex &&
        !options.some((option) => option.versionGroupName === currentVersionGroupName)
      ) {
        options.unshift({
          versionGroupName: currentVersionGroup.name,
          versionGroupFormattedName: currentVersionGroup.formattedName,
          pokedexName: currentPokedex.name,
          pokedexFormattedName: currentPokedex.formattedName,
        });
      }
    }

    return options;
  });

  constructor(private route: ActivatedRoute) {
    this.route.paramMap
      .pipe(
        map((params) => ({
          name: params.get('name') || '',
          versionGroupName: params.get('versionGroupName') || '',
          pokedexName: params.get('pokedexName') || '',
        })),
        tap(({ name, versionGroupName, pokedexName }) => {
          this.pokemonName.set(name);
          this.versionGroupName.set(versionGroupName);
          this.pokedexName.set(pokedexName);
          this.pokedexEntries.set([]);

          if (name) {
            this.pokemonStore.loadPokemonByName(name);
          }
        }),
        switchMap(({ pokedexName }) =>
          pokedexName ? this.gameService.getPokedexByName(pokedexName) : of(null)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((pokedex) => {
        this.pokedexEntries.set(pokedex?.pokemon_entries || []);
      });
  }

  onVersionGroupChange(versionGroupName: string): void {
    const selectedOption = this.availableVersionGroupOptions().find(
      (option) => option.versionGroupName === versionGroupName
    );

    if (!selectedOption || !this.pokemonName()) {
      return;
    }

    void this.router.navigate([
      '/pokedex',
      selectedOption.versionGroupName,
      selectedOption.pokedexName,
      this.pokemonName(),
    ]);
  }
}
