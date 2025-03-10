import { Component, computed, effect, inject, signal } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { PokedexStore } from "src/app/shared/store/pokedex.store";
import { PokemonStore } from "src/app/shared/store/pokemon.store";
import { PokemonSummaryCardComponent } from "../../components/pokemon-summary-card/pokemon-summary-card.component";
import { PokemonMovesTabComponent } from "../../components/tabs/pokemon-moves-tab/pokemon-moves-tab.component";

@Component({
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    PokemonSummaryCardComponent,
    PokemonMovesTabComponent,
  ],
  selector: "app-pokemon",
  templateUrl: "pokemon.component.html",
  styleUrl: "pokemon.component.scss",
  providers: [PokemonStore],
})
export class PokemonComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly pokedexStore = inject(PokedexStore);
  pokemonName = signal<string>("");
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
