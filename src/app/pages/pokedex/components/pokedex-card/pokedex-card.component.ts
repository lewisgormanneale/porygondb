import { Component, Input, signal, WritableSignal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PokedexResult } from "src/app/models/pokedex.model";
import { RouterModule } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-pokedex-card",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: "pokedex-card.component.html",
  styleUrl: "pokedex-card.component.scss",
})
export class PokedexCardComponent {
  @Input() pokemon: PokedexResult = {} as PokedexResult;
  imageLoading: WritableSignal<boolean> = signal(true);

  onImageLoad() {
    this.imageLoading.set(false);
  }
}
