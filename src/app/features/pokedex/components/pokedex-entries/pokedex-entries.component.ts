import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap, tap } from 'rxjs';
import { GameService } from '../../../../shared/services/game.service';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { PokedexEntriesStore } from '../../+state/pokedex-entries.store';
import { PokedexEntryComponent } from './pokedex-entry/pokedex-entry.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NATIONAL_POKEDEX_NAME } from '../../../../shared/+state/data/version-group.constants';
import { PokemonEntry } from '../../../../shared/interfaces/pokeapi';

@Component({
  selector: 'pokedex-entries',
  imports: [PokedexEntryComponent, MatPaginatorModule, MatProgressBarModule],
  templateUrl: 'pokedex-entries.component.html',
  styleUrls: ['pokedex-entries.component.scss'],
  providers: [PokedexEntriesStore],
})
export class PokedexEntriesComponent implements OnInit {
  hidePageSize = signal(true);
  readonly pokedexName = input('');
  readonly versionGroupName = input('');
  readonly showShiny = input(false);
  readonly pokedexName$ = toObservable(this.pokedexName);
  readonly versionGroupName$ = toObservable(this.versionGroupName);
  readonly gameService = inject(GameService);
  readonly pokemonService = inject(PokemonService);
  readonly pokedexEntriesStore = inject(PokedexEntriesStore);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    combineLatest([this.pokedexName$, this.versionGroupName$])
      .pipe(
        filter(([pokedex, versionGroup]) => !!pokedex && !!versionGroup),
        switchMap(([pokedexName]) => {
          if (pokedexName === NATIONAL_POKEDEX_NAME) {
            // For National mode, load all Pokemon species
            return this.pokemonService.listPokemonSpecies(0, 10000).pipe(
              map((list) =>
                list.results.map(
                  (species, index): PokemonEntry => ({
                    entry_number: index + 1,
                    pokemon_species: species,
                  })
                )
              ),
              tap((entries) => {
                this.pokedexEntriesStore.setPokedexEntries(entries);
                this.pokedexEntriesStore.loadPokemonSpecies();
              })
            );
          } else {
            return this.gameService.getPokedexByName(pokedexName).pipe(
              tap((pokedex) => {
                this.pokedexEntriesStore.setPokedexEntries(pokedex.pokemon_entries);
                this.pokedexEntriesStore.loadPokemonSpecies();
              })
            );
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.matches) {
          this.hidePageSize.set(true);
        } else {
          this.hidePageSize.set(false);
        }
      });
  }
}
