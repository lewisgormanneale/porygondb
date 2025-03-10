import { Component, computed, effect, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { PokedexStore } from "src/app/shared/store/pokedex.store";
import { PokemonStore } from "src/app/shared/store/pokemon.store";

@Component({
  selector: "pokemon-navigation",
  imports: [
    MatIconModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: "./pokemon-navigation.component.html",
  styleUrl: "./pokemon-navigation.component.scss",
})
export class PokemonNavigationComponent {
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
