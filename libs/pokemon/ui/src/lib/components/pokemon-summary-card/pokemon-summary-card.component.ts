import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PokedexStore, PokemonStore } from 'shared-data-access';
import { getPokemonTypeColor, LocalisePipe } from 'shared-utils';
import { MatGridListModule } from '@angular/material/grid-list';
import { PokemonTypeChipSetComponent } from "../pokemon-type-chip-set/pokemon-type-chip-set.component";

@Component({
  selector: 'lib-pokemon-summary-card',
  imports: [
    MatCardModule,
    MatChipsModule,
    LocalisePipe,
    TitleCasePipe,
    NgOptimizedImage,
    MatGridListModule,
    PokemonTypeChipSetComponent
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
