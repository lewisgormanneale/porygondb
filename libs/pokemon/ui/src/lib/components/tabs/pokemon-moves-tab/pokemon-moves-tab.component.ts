import {
  AfterViewInit,
  Component,
  effect,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Move } from 'pokenode-ts';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MoveStore, PokemonStore } from 'shared-data-access';
import { LocalisePipe } from 'shared-utils';
import { PokemonTypeChipSetComponent } from '../../pokemon-type-chip-set/pokemon-type-chip-set.component';

@Component({
  selector: 'lib-pokemon-moves-tab',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    LocalisePipe,
    PokemonTypeChipSetComponent,
  ],
  templateUrl: './pokemon-moves-tab.component.html',
  styleUrl: './pokemon-moves-tab.component.scss',
  providers: [MoveStore],
})
export class PokemonMovesTabComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly moveStore = inject(MoveStore);
  displayedColumns = ['name', 'type'];
  dataSource = new MatTableDataSource<Move>();

  constructor() {
    effect(() => {
      if (this.pokemonStore.selectedEntity().moves.length > 0) {
        this.loadPokemonMoves();
      }
    });
  }

  loadPokemonMoves(event?: PageEvent): void {
    this.moveStore.loadMovesForSelectedPokemon(event);
    this.dataSource.data = this.moveStore.entities();
  }

  onPageChange(event: PageEvent): void {
    this.loadPokemonMoves(event);
  }
}
