import { Component, Input } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PokedexResult } from "src/app/models/pokedex.model";

@Component({
  selector: "app-pokedex-card",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgOptimizedImage,
  ],
  templateUrl: "pokedex-card.component.html",
  styleUrl: "pokedex-card.component.scss",
})
export class PokedexCardComponent {
  @Input() pokemon: PokedexResult = {} as PokedexResult;
}
