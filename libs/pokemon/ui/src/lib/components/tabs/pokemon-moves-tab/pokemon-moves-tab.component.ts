import {
  AfterViewInit,
  Component,
  effect,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonMove } from 'pokenode-ts';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PokemonStore } from 'shared-data-access';

@Component({
  selector: 'lib-pokemon-moves-tab',
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './pokemon-moves-tab.component.html',
  styleUrl: './pokemon-moves-tab.component.scss',
})
export class PokemonMovesTabComponent implements AfterViewInit {
  readonly pokemonStore = inject(PokemonStore);
  displayedColumns = ['name'];
  dataSource = new MatTableDataSource<PokemonMove>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const selectedPokemon = this.pokemonStore.selectedEntity();
      if (selectedPokemon && selectedPokemon.moves) {
        this.dataSource.data = selectedPokemon.moves;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
