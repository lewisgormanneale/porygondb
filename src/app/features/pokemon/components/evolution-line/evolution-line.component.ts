import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { EvolutionDetail } from '../../../../shared/interfaces/pokeapi';
import {
  dedupeEvolutionDetails,
  EvolutionMethodVisual,
  formatEvolutionDetail,
  getEvolutionMethodVisual,
} from '../../utils/format-evolution-detail.util';

@Component({
  selector: 'evolution-line',
  imports: [RouterModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './evolution-line.component.html',
  styleUrl: './evolution-line.component.scss',
})
export class EvolutionLineComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly versionGroupName = input.required<string>();
  readonly pokedexName = input.required<string>();

  getSpriteUrl(speciesId: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
  }

  getItemSpriteUrl(itemName: string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
  }

  dedupeEvolutionDetails(details: EvolutionDetail[]): EvolutionDetail[] {
    return dedupeEvolutionDetails(details);
  }

  formatEvolutionDetail(detail: EvolutionDetail): string {
    return formatEvolutionDetail(detail);
  }

  getEvolutionMethodVisual(detail: EvolutionDetail): EvolutionMethodVisual {
    return getEvolutionMethodVisual(detail);
  }
}
