import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleCasePipe } from '@angular/common';
import { PokemonEntry } from '../../../../shared/interfaces/pokeapi';

@Component({
  selector: 'pokemon-nav-bar',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, TitleCasePipe],
  templateUrl: './pokemon-nav-bar.component.html',
  styleUrl: './pokemon-nav-bar.component.scss',
})
export class PokemonNavBarComponent {
  readonly currentPokemonName = input.required<string>();
  readonly versionGroupName = input.required<string>();
  readonly pokedexName = input.required<string>();
  readonly pokedexEntries = input<PokemonEntry[]>([]);

  readonly navigation = computed(() => {
    const entries = this.pokedexEntries();
    const currentIndex = entries.findIndex(
      (entry) => entry.pokemon_species.name === this.currentPokemonName()
    );

    if (!entries.length || currentIndex === -1) {
      return { prev: null, next: null, currentIndex: -1, total: entries.length };
    }

    return {
      prev: currentIndex > 0 ? entries[currentIndex - 1] : null,
      next: currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null,
      currentIndex,
      total: entries.length,
    };
  });

  getSpriteUrl(speciesUrl: string): string {
    const id = speciesUrl.split('/').filter(Boolean).pop() || '0';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
