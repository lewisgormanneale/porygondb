import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LocalisePipe } from 'shared-utils';
import { PokemonStore } from 'shared-data-access';

@Component({
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    LocalisePipe,
    NgOptimizedImage,
    TitleCasePipe,
  ],
  selector: 'app-pokemon',
  templateUrl: 'pokemon.component.html',
  styleUrl: 'pokemon.component.scss',
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  pokemonName = signal<string>('');

  constructor(private route: ActivatedRoute) {
    this.pokemonName.set(this.route.snapshot.paramMap.get('name') || '');
    effect(() => {
      if (this.pokemonName()) {
        this.pokemonStore.loadPokemonByName(this.pokemonName());
      }
    });
  }
}
