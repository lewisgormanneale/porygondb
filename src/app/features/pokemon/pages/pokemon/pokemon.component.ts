import { Component, effect, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PokemonSummaryComponent } from '../../components/pokemon-summary/pokemon-summary.component';
import { PokemonStatsTabComponent } from '../../components/tabs/pokemon-stats-tab/pokemon-stats-tab.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonDetailsTabComponent } from '../../components/tabs/pokemon-details-tab/pokemon-details-tab.component';

@Component({
  imports: [
    MatProgressBarModule,
    MatTabsModule,
    RouterModule,
    PokemonSummaryComponent,
    PokemonStatsTabComponent,
    PokemonDetailsTabComponent,
  ],
  selector: 'app-pokemon',
  templateUrl: 'pokemon.component.html',
  styleUrl: 'pokemon.component.scss',
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  pokemonName = signal<string>('');

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const name = params.get('name') || '';
      this.pokemonName.set(name);
    });
    effect(() => {
      if (this.pokemonName()) {
        this.pokemonStore.loadPokemonByName(this.pokemonName());
      }
    });
  }
}
