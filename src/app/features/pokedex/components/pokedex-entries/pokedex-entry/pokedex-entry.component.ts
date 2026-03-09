import { Component, computed, input, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { PokemonSpecies } from '../../../../../shared/interfaces/pokeapi';
import { LocalisePipe } from '../../../../../shared/pipes/localise.pipe';

@Component({
  selector: 'pokedex-entry',
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, RouterModule, LocalisePipe],
  templateUrl: 'pokedex-entry.component.html',
  styleUrl: 'pokedex-entry.component.scss',
})
export class PokedexEntryComponent {
  pokemon = input<PokemonSpecies>();
  versionGroupName = input.required<string>();
  pokedexName = input.required<string>();
  showShiny = input(false);
  imageLoading: WritableSignal<boolean> = signal(true);

  readonly spriteUrl = computed(() => {
    const id = this.pokemon()?.id;
    if (!id) return '';
    const shinyPath = this.showShiny() ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${shinyPath}${id}.png`;
  });

  onImageLoad() {
    this.imageLoading.set(false);
  }
}
