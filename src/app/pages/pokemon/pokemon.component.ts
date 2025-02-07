import { AsyncPipe, NgOptimizedImage } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { PokemonResult } from "src/app/models/pokemon.model";
import { loadPokemon } from "src/app/store/actions/pokemon.actions";
import { AppState } from "src/app/store/app.state";
import { LocalisePipe } from "../../pipes/localise.pipe";

@Component({
  imports: [
    AsyncPipe,
    MatProgressBarModule,
    NgOptimizedImage,
    MatTabsModule,
    LocalisePipe,
  ],
  selector: "app-pokemon",
  templateUrl: "pokemon.component.html",
  styleUrl: "pokemon.component.scss",
})
export class PokemonComponent implements OnInit {
  pokemon$: Observable<PokemonResult>;
  loading$: Observable<boolean>;
  pokemonName: string = "";

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {
    this.pokemonName = this.route.snapshot.paramMap.get("name") || "";
    this.pokemon$ = this.store.select((state) => state.pokemon.pokemon);
    this.loading$ = this.store.select((state) => state.pokemon.loading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadPokemon({ name: this.pokemonName }));
  }
}
