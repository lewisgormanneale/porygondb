import { Component, input, signal, WritableSignal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { PokemonSpecies } from "pokenode-ts";
import { LocalisePipe } from "../../../../../shared/pipes/localise.pipe";

@Component({
  selector: "pokedex-entry",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    LocalisePipe,
  ],
  templateUrl: "pokedex-entry.component.html",
  styleUrl: "pokedex-entry.component.scss",
})
export class PokedexEntryComponent {
  pokemon = input<PokemonSpecies>();
  imageLoading: WritableSignal<boolean> = signal(true);

  onImageLoad() {
    this.imageLoading.set(false);
  }
}
