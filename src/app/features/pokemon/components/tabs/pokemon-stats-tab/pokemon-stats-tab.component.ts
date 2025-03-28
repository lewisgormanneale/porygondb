import {
  AfterViewInit,
  Component,
  computed,
  inject,
  ViewChild,
} from "@angular/core";
import { PokemonStore } from "src/app/shared/+state/pokemon.store";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";

interface StatData {
  name: string;
  baseValue: number;
}

@Component({
  selector: "pokemon-stats-tab",
  imports: [MatProgressBarModule, MatTableModule, MatSortModule],
  templateUrl: "./pokemon-stats-tab.component.html",
  styleUrl: "./pokemon-stats-tab.component.scss",
})
export class PokemonStatsTabComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  readonly pokemonStore = inject(PokemonStore);
  columnsToDisplay = ["name", "baseValue"];
  stats: StatData[] = [
    {
      name: "HP",
      baseValue: this.pokemonStore.selectedPokemonStats()["hp"],
    },
    {
      name: "Attack",
      baseValue: this.pokemonStore.selectedPokemonStats()["hp"],
    },
    {
      name: "Defense",
      baseValue: this.pokemonStore.selectedPokemonStats()["defense"],
    },
    {
      name: "Special Attack",
      baseValue: this.pokemonStore.selectedPokemonStats()["special-attack"],
    },
    {
      name: "Special Defense",
      baseValue: this.pokemonStore.selectedPokemonStats()["special-defense"],
    },
    {
      name: "Speed",
      baseValue: this.pokemonStore.selectedPokemonStats()["speed"],
    },
  ];
  dataSource = new MatTableDataSource(this.stats);
  baseStatTotal = computed(() => {
    return this.stats.map((stat) => stat.baseValue).reduce((a, b) => a + b);
  });

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
