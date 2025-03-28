import { NgOptimizedImage } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { LocalisePipe } from "../../../../shared/pipes/localise.pipe";
import { PokemonStore } from "../../../../shared/store/pokemon.store";

@Component({
  selector: "pokemon-summary",
  imports: [MatCardModule, MatChipsModule, LocalisePipe, NgOptimizedImage],
  templateUrl: "./pokemon-summary.component.html",
  styleUrl: "./pokemon-summary.component.scss",
})
export class PokemonSummaryComponent {
  readonly pokemonStore = inject(PokemonStore);
  selectedPokemonHomeFrontSprite = signal<string>("");
  fallbackImageSmall = "assets/images/question-mark.png";
  fallbackImageLarge = "assets/images/question-mark-2.png";

  constructor() {
    effect(() => {
      this.selectedPokemonHomeFrontSprite.set(
        this.pokemonStore.selectedPokemonHomeFrontSprite()
      );
    });
  }

  onError() {
    this.selectedPokemonHomeFrontSprite.set(this.fallbackImageLarge);
  }

  setSelectedPokemonVariety(varietyId: number) {
    this.selectedPokemonHomeFrontSprite.set("");
    this.pokemonStore.setSelectedId(varietyId);
  }
}
