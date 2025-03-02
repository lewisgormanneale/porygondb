import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PokedexStore, PokemonStore } from 'shared-data-access';
import { LocalisePipe } from 'shared-utils';
import { MatGridListModule } from '@angular/material/grid-list';
import { PokemonTypeChipComponent } from '../pokemon-type-chip/pokemon-type-chip.component';

@Component({
  selector: 'lib-pokemon-summary-card',
  imports: [
    MatCardModule,
    MatChipsModule,
    LocalisePipe,
    NgOptimizedImage,
    MatGridListModule,
    PokemonTypeChipComponent,
  ],
  templateUrl: './pokemon-summary-card.component.html',
  styleUrl: './pokemon-summary-card.component.scss',
})
export class PokemonSummaryCardComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly pokedexStore = inject(PokedexStore);

  setSelectedPokemonVariety(varietyId: number) {
    this.pokemonStore.setSelectedId(varietyId);
  }
}
