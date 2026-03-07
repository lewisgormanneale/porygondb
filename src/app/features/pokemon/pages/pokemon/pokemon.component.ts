import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonSummaryComponent } from '../../components/pokemon-summary/pokemon-summary.component';
import { PokemonStatsTabComponent } from '../../components/tabs/pokemon-stats-tab/pokemon-stats-tab.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonDetailsTabComponent } from '../../components/tabs/pokemon-details-tab/pokemon-details-tab.component';
import { EvolutionLineComponent } from '../../components/evolution-line/evolution-line.component';
import { PokemonAdditionalInfoComponent } from '../../components/pokemon-additional-info/pokemon-additional-info.component';
import { PokemonNavBarComponent } from '../../components/pokemon-nav-bar/pokemon-nav-bar.component';
import { GameService } from '../../../../shared/services/game.service';
import { PokemonEntry } from '../../../../shared/interfaces/pokeapi';

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
  pokemonName = signal<string>('');
  versionGroupName = signal<string>('');
  pokedexName = signal<string>('');
  pokedexEntries = signal<PokemonEntry[]>([]);

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
}
