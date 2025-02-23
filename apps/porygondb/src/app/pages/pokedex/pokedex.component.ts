import { Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PokedexCardComponent } from 'pokedex-ui';
import { PokemonStore, VersionStore } from 'shared-data-access';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [
    MatPaginatorModule,
    MatProgressBarModule,
    PokedexCardComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  selector: 'app-pokedex',
  templateUrl: 'pokedex.component.html',
  styleUrl: 'pokedex.component.scss',
  providers: [PokemonStore],
})
export class PokedexComponent {
  readonly pokemonStore = inject(PokemonStore);
  pokedexName: string;

  constructor(private route: ActivatedRoute) {
    this.pokedexName = this.route.snapshot.paramMap.get('name') || '';
  }

  loadPokemon(event?: PageEvent): void {
    this.pokemonStore.listPokemonSpecies(event);
  }
}
