import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from 'shared-ui';
import { Pokemon } from 'pokenode-ts';

@Component({
  selector: 'lib-pokemon-moves-tab',
  imports: [CommonModule, TableComponent],
  templateUrl: './pokemon-moves-tab.component.html',
  styleUrl: './pokemon-moves-tab.component.scss',
})
export class PokemonMovesTabComponent {
  selectedPokemonVariety = input<Pokemon>();
}
