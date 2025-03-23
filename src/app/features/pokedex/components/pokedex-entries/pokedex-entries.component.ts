import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from "@angular/core";
import { GameService } from "../../../../shared/services/game.service";
import { PokedexEntriesStore } from "../../store/pokedex-entries.store";
import { PokedexEntryComponent } from "./pokedex-entry/pokedex-entry.component";
import { MatPaginatorModule } from "@angular/material/paginator";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

@Component({
  selector: "pokedex-entries",
  imports: [PokedexEntryComponent, MatPaginatorModule],
  templateUrl: "pokedex-entries.component.html",
  styleUrls: ["pokedex-entries.component.scss"],
  providers: [PokedexEntriesStore],
})
export class PokedexEntriesComponent implements OnInit {
  hidePageSize = signal(true);
  readonly pokedexName = input("");
  readonly gameService = inject(GameService);
  readonly pokedexEntriesStore = inject(PokedexEntriesStore);
  readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    effect(() => {
      if (this.pokedexName()) {
        this.gameService
          .getPokedexByName(this.pokedexName())
          .subscribe((pokedex) => {
            this.pokedexEntriesStore.setPokedexEntries(pokedex.pokemon_entries);
            this.pokedexEntriesStore.loadPokemonSpecies(undefined);
          });
      }
    });
  }

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait])
      .subscribe((result) => {
        if (result.matches) {
          this.hidePageSize.set(true);
        } else {
          this.hidePageSize.set(false);
        }
      });
  }
}
