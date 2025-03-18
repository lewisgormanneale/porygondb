import { Component, effect, inject, signal } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { PokemonSummaryComponent } from "../../components/pokemon-summary/pokemon-summary.component";
import { PokemonMovesTabComponent } from "../../components/tabs/pokemon-moves-tab/pokemon-moves-tab.component";
import { PokemonStatsTabComponent } from "../../components/tabs/pokemon-stats-tab/pokemon-stats-tab.component";
import { PokemonStore } from "../../../../shared/store/pokemon.store";

@Component({
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    PokemonSummaryComponent,
    PokemonMovesTabComponent,
    PokemonStatsTabComponent,
  ],
  selector: "app-pokemon",
  templateUrl: "pokemon.component.html",
  styleUrl: "pokemon.component.scss",
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  pokemonName = signal<string>("");

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const name = params.get("name") || "";
      this.pokemonName.set(name);
    });
    effect(() => {
      if (this.pokemonName()) {
        this.pokemonStore.loadPokemonByName(this.pokemonName());
      }
    });
  }
}
