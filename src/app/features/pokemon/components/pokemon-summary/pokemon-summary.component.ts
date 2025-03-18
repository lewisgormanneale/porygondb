import { NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatGridListModule } from "@angular/material/grid-list";
import { TypeChipComponent } from "src/app/shared/components/type-chip/type-chip.component";
import { LocalisePipe } from "src/app/shared/pipes/localise.pipe";
import { PokemonStore } from "src/app/shared/store/pokemon.store";

@Component({
  selector: "pokemon-summary",
  imports: [
    MatCardModule,
    MatChipsModule,
    LocalisePipe,
    NgOptimizedImage,
    MatGridListModule,
    TypeChipComponent,
  ],
  templateUrl: "./pokemon-summary.component.html",
  styleUrl: "./pokemon-summary.component.scss",
})
export class PokemonSummaryComponent {
  readonly pokemonStore = inject(PokemonStore);

  setSelectedPokemonVariety(varietyId: number) {
    this.pokemonStore.setSelectedId(varietyId);
  }
}
