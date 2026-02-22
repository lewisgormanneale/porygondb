import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LocalisePipe } from '../../../../shared/pipes/localise.pipe';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

@Component({
  selector: 'pokemon-summary',
  imports: [MatCardModule, LocalisePipe, NgOptimizedImage],
  templateUrl: './pokemon-summary.component.html',
  styleUrl: './pokemon-summary.component.scss',
})
export class PokemonSummaryComponent {
  readonly pokemonStore = inject(PokemonStore);
  fallbackImageSmall = 'assets/images/question-mark.png';
  fallbackImageLarge = 'assets/images/question-mark-2.png';

  setSelectedPokemonVariety(varietyId: number) {
    this.pokemonStore.setSelectedId(varietyId);
  }
}
