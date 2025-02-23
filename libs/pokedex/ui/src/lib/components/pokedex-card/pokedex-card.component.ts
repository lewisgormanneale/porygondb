import { Component, Input, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { LocalisePipe } from 'shared-utils';
import { PokemonSpecies } from 'pokenode-ts';

@Component({
  selector: 'lib-pokedex-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    LocalisePipe,
  ],
  templateUrl: 'pokedex-card.component.html',
  styleUrl: 'pokedex-card.component.scss',
})
export class PokedexCardComponent {
  @Input() pokemon: PokemonSpecies = {} as PokemonSpecies;
  imageLoading: WritableSignal<boolean> = signal(true);

  onImageLoad() {
    this.imageLoading.set(false);
  }
}
