import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokedexNavigationService } from '../../../../shared/services/pokedex-navigation.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'pokemon-nav-bar',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, TitleCasePipe],
  templateUrl: './pokemon-nav-bar.component.html',
  styleUrl: './pokemon-nav-bar.component.scss',
})
export class PokemonNavBarComponent {
  readonly navService = inject(PokedexNavigationService);
  readonly currentPokemonName = input.required<string>();

  readonly navigation = computed(() => {
    return this.navService.getAdjacentPokemon(this.currentPokemonName());
  });

  readonly context = computed(() => this.navService.context());

  getSpriteUrl(speciesUrl: string): string {
    const id = speciesUrl.split('/').filter(Boolean).pop() || '0';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
