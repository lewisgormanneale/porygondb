import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LocalisePipe } from 'shared-utils';
import { PokedexStore, PokemonStore } from 'shared-data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { PokemonSummaryCardComponent } from 'pokemon-ui';

@Component({
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule,
    PokemonSummaryCardComponent,
  ],
  selector: 'app-pokemon',
  templateUrl: 'pokemon.component.html',
  styleUrl: 'pokemon.component.scss',
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly pokedexStore = inject(PokedexStore);
  pokemonName = signal<string>('');
  currentPokemonEntryNumberForSelectedPokedex = computed(() => {
    if (this.pokedexStore.pokemonEntriesForSelectedPokedex().length === 0) {
      return undefined;
    }
    return this.pokedexStore
      .pokemonEntriesForSelectedPokedex()
      .findIndex((entry) => entry.pokemon_species.name === this.pokemonName());
  });

  previousPokemonName = computed(() => {
    if (this.pokedexStore.pokemonEntriesForSelectedPokedex().length === 0) {
      return undefined;
    }
    const index = this.pokedexStore
      .pokemonEntriesForSelectedPokedex()
      .findIndex((entry) => entry.pokemon_species.name === this.pokemonName());
    if (index === 0) {
      return this.pokedexStore.pokemonEntriesForSelectedPokedex()[
        this.pokedexStore.pokemonEntriesForSelectedPokedex().length - 1
      ].pokemon_species.name;
    }
    return this.pokedexStore.pokemonEntriesForSelectedPokedex()[index - 1]
      .pokemon_species.name;
  });

  nextPokemonName = computed(() => {
    if (this.pokedexStore.pokemonEntriesForSelectedPokedex().length === 0) {
      return undefined;
    }
    const index = this.pokedexStore
      .pokemonEntriesForSelectedPokedex()
      .findIndex((entry) => entry.pokemon_species.name === this.pokemonName());
    if (
      index ===
      this.pokedexStore.pokemonEntriesForSelectedPokedex().length - 1
    ) {
      return this.pokedexStore.pokemonEntriesForSelectedPokedex()[0]
        .pokemon_species.name;
    }
    return this.pokedexStore.pokemonEntriesForSelectedPokedex()[index + 1]
      .pokemon_species.name;
  });

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const name = params.get('name') || '';
      this.pokemonName.set(name);
    });
    this.pokedexStore.loadAllPokedexes();
    effect(() => {
      if (this.pokemonName()) {
        this.pokemonStore.loadPokemonByName(this.pokemonName());
      }
    });
  }
}
