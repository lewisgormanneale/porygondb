import { Component, computed, inject, ViewChild } from "@angular/core";
import { PokemonStore } from "src/app/shared/store/pokemon.store";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { StatStore } from "../../../../../shared/store/stat.store";
import { MatTable, MatTableModule } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Move } from "pokenode-ts";

interface StatData {
  name: string;
  baseValue: number;
}

@Component({
  selector: "pokemon-stats-tab",
  imports: [MatProgressBarModule, MatTableModule],
  templateUrl: "./pokemon-stats-tab.component.html",
  styleUrl: "./pokemon-stats-tab.component.scss",
  providers: [StatStore],
})
export class PokemonStatsTabComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Move>;
  readonly pokemonStore = inject(PokemonStore);
  readonly statStore = inject(StatStore);
  readonly columnsToDisplay = ["name", "baseValue"];
  pokemonStatsDataSource = computed(() => {
    const pokemon = this.pokemonStore.selectedEntity();
    const stats = this.statStore.entities();
    if (!pokemon || !pokemon.stats || pokemon.stats.length === 0) {
      return [];
    }
    let statData: StatData[] = [];
    for (const stat of pokemon.stats) {
      statData.push({
        name: stat.stat.name,
        baseValue: stat.base_stat,
      });
    }
    return statData;
  });
  baseStatTotal = computed(() => {
    return this.pokemonStatsDataSource()
      .map((stat) => stat.baseValue)
      .reduce((a, b) => a + b);
  });
}
