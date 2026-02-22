import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

@Component({
  selector: 'evolution-line',
  imports: [RouterModule, MatCardModule],
  templateUrl: './evolution-line.component.html',
  styleUrl: './evolution-line.component.scss',
})
export class EvolutionLineComponent {
  readonly pokemonStore = inject(PokemonStore);

  getSpriteUrl(speciesId: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
  }
}
