import { NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LocalisePipe } from 'shared-utils';
import { PokemonStore } from 'pokemon-data-access';

@Component({
  imports: [
    MatProgressBarModule,
    NgOptimizedImage,
    MatTabsModule,
    LocalisePipe,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
  ],
  selector: 'app-pokemon',
  templateUrl: 'pokemon.component.html',
  styleUrl: 'pokemon.component.scss',
  providers: [PokemonStore],
})
export class PokemonComponent implements OnInit {
  pokemonName: string;
  readonly pokemonStore = inject(PokemonStore);

  constructor(private route: ActivatedRoute) {
    this.pokemonName = this.route.snapshot.paramMap.get('name') || '';
  }

  ngOnInit(): void {
    this.pokemonStore.loadByName(this.pokemonName);
  }
}
