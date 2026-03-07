import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PokemonSummaryComponent } from '../../components/pokemon-summary/pokemon-summary.component';
import { PokemonStatsSectionComponent } from '../../components/pokemon-stats-section/pokemon-stats-section.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonDetailsTabComponent } from '../../components/tabs/pokemon-details-tab/pokemon-details-tab.component';
import { EvolutionLineComponent } from '../../components/evolution-line/evolution-line.component';
import { PokemonAdditionalInfoComponent } from '../../components/pokemon-additional-info/pokemon-additional-info.component';
import { PokemonNavBarComponent } from '../../components/pokemon-nav-bar/pokemon-nav-bar.component';
import { PokemonMovesSectionComponent } from '../../components/pokemon-moves-section/pokemon-moves-section.component';
import { PokemonLocationsSectionComponent } from '../../components/pokemon-locations-section/pokemon-locations-section.component';
import { GameService } from '../../../../shared/services/game.service';
import { PokemonEntry } from '../../../../shared/interfaces/pokeapi';
import { VersionGroups } from '../../../../shared/+state/data/version-group.constants';
import {
  getVersionGroupOptions,
  PokemonVersionGroupOption,
} from '../../utils/get-version-group-options.util';

@Component({
  imports: [
    MatProgressBarModule,
    MatCardModule,
    RouterModule,
    PokemonSummaryComponent,
    PokemonStatsSectionComponent,
    PokemonDetailsTabComponent,
    EvolutionLineComponent,
    PokemonMovesSectionComponent,
    PokemonLocationsSectionComponent,
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
    return getVersionGroupOptions({
      versionGroups: VersionGroups,
      selectedPokemon: this.pokemonStore.selectedEntity(),
      speciesDetails: this.pokemonStore.speciesDetails(),
      currentVersionGroupName: this.versionGroupName(),
      currentPokedexName: this.pokedexName(),
    });
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
