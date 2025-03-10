import { Component, inject, signal, effect } from "@angular/core";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { ActivatedRoute } from "@angular/router";
import { PokedexSpeciesListStore } from "../../store/pokedex-species-list.store";
import { PokedexStore } from "src/app/shared/store/pokedex.store";
import { PokedexCardComponent } from "../../components/pokedex-card/pokedex-card.component";

@Component({
  imports: [
    MatPaginatorModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    PokedexCardComponent,
  ],
  selector: "app-pokedex",
  templateUrl: "pokedex.component.html",
  styleUrl: "pokedex.component.scss",
  providers: [PokedexSpeciesListStore],
})
export class PokedexComponent {
  readonly pokedexStore = inject(PokedexStore);
  readonly pokemonSpeciesListStore = inject(PokedexSpeciesListStore);
  pokedexName = signal<string>("");

  constructor(private route: ActivatedRoute) {
    this.pokedexName.set(this.route.snapshot.paramMap.get("name") || "");
    this.pokedexStore.loadPokedexByName(this.pokedexName);
    effect(() => {
      if (this.pokemonSpeciesListStore.pokemonEntries().length > 0) {
        this.loadPokemonSpecies();
      }
    });
  }

  loadPokemonSpecies(event?: PageEvent): void {
    this.pokemonSpeciesListStore.loadPokemonSpecies(event);
  }

  onPageChange(event: PageEvent): void {
    this.loadPokemonSpecies(event);
  }
}
