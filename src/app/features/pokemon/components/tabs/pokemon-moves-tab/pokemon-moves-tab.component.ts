import { Component, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Move } from "pokenode-ts";
import { MatTable, MatTableModule } from "@angular/material/table";
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatCardModule } from "@angular/material/card";
import { LocalisePipe } from "src/app/shared/pipes/localise.pipe";
import { MoveStore } from "src/app/shared/store/move.store";
import { PokemonStore } from "src/app/shared/store/pokemon.store";
import { TypeChipComponent } from "src/app/shared/components/type-chip/type-chip.component";

@Component({
  selector: "pokemon-moves-tab",
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    LocalisePipe,
    TypeChipComponent,
  ],
  templateUrl: "./pokemon-moves-tab.component.html",
  styleUrl: "./pokemon-moves-tab.component.scss",
  providers: [MoveStore],
})
export class PokemonMovesTabComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly moveStore = inject(MoveStore);
  displayedColumns = ["name", "type", "power", "accuracy", "pp"];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Move>;

  constructor() {
    if (
      this.pokemonStore.selectedEntity() &&
      this.pokemonStore.selectedEntity()?.moves
    ) {
      this.moveStore.setPokemonMoves(this.pokemonStore.selectedEntity()!.moves);
      this.loadPokemonMoves();
    }
  }
  loadPokemonMoves(event?: PageEvent): void {
    this.moveStore.loadMovesForPaginatedPokemonMoves(event);
  }
}
