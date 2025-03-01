import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { PokemonType } from 'pokenode-ts';
import { getPokemonTypeColor } from 'shared-utils';

@Component({
  selector: 'lib-pokemon-type-chip-set',
  imports: [CommonModule, MatChipsModule],
  templateUrl: './pokemon-type-chip-set.component.html',
  styleUrl: './pokemon-type-chip-set.component.scss',
})
export class PokemonTypeChipSetComponent {
  pokemonTypes = input.required<PokemonType[]>();

  getTypeColor(typeName: string): string {
    return getPokemonTypeColor(typeName);
  }
}
