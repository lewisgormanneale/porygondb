import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
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
import { PokemonTypeChipComponent } from '../../pokemon-type-chip/pokemon-type-chip.component';

@Component({
  selector: 'lib-pokemon-moves-tab',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    LocalisePipe,
    PokemonTypeChipComponent,
  ],
  templateUrl: './pokemon-moves-tab.component.html',
  styleUrl: './pokemon-moves-tab.component.scss',
  providers: [MoveStore],
})
export class PokemonMovesTabComponent implements OnInit, AfterViewInit {
  readonly pokemonStore = inject(PokemonStore);
  readonly moveStore = inject(MoveStore);
  displayedColumns = ['name', 'type'];
  dataSource = new MatTableDataSource<Move>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadPokemonMoves();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource = this.moveStore.selectedPokemonMovesDataSource();
  }

  loadPokemonMoves(event?: PageEvent): void {
    this.moveStore.loadMovesForSelectedPokemon(event);
    this.dataSource.data = this.moveStore.selectedPokemonMovesDataSource().data;
    this.dataSource.sort = this.moveStore.selectedPokemonMovesDataSource().sort;
    this.dataSource.paginator =
      this.moveStore.selectedPokemonMovesDataSource().paginator;
  }

  onPageChange(event: PageEvent): void {
    this.loadPokemonMoves(event);
  }
}
