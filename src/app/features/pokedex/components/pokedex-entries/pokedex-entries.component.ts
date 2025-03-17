import { Component, effect, inject, input } from "@angular/core";
import { GameService } from "../../../../shared/services/game.service";
import { PokedexEntriesStore } from "../../store/pokedex-entries.store";
import { PokedexEntryComponent } from "../pokedex-entry/pokedex-entry.component";
import { MatPaginatorModule } from "@angular/material/paginator";

@Component({
  selector: "pokedex-entries",
  imports: [PokedexEntryComponent, MatPaginatorModule],
  templateUrl: "pokedex-entries.component.html",
  styleUrls: ["pokedex-entries.component.scss"],
  providers: [PokedexEntriesStore],
})
export class PokedexEntriesComponent {
  readonly pokedexName = input("");
  readonly gameService = inject(GameService);
  readonly pokedexEntriesStore = inject(PokedexEntriesStore);

  constructor() {
    effect(() => {
      if (this.pokedexName()) {
        this.gameService
          .getPokedexByName(this.pokedexName())
          .subscribe((pokedex) => {
            console.log(this.pokedexName());
            this.pokedexEntriesStore.setPokedexEntries(pokedex.pokemon_entries);
            this.pokedexEntriesStore.loadPokemonSpecies(undefined);
          });
      }
    });
  }
}
