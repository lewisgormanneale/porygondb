import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, filter, switchMap, tap } from 'rxjs';
import { GameService } from '../../../../shared/services/game.service';
import { PokedexEntriesStore } from '../../+state/pokedex-entries.store';
import { PokedexEntryComponent } from './pokedex-entry/pokedex-entry.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PokedexNavigationService } from '../../../../shared/services/pokedex-navigation.service';

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
  readonly gameService = inject(GameService);
  readonly pokedexEntriesStore = inject(PokedexEntriesStore);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly navService = inject(PokedexNavigationService);

  ngOnInit() {
    combineLatest([toObservable(this.pokedexName), toObservable(this.versionGroupName)])
      .pipe(
        filter(([pokedex, versionGroup]) => !!pokedex && !!versionGroup),
        switchMap(([pokedexName, versionGroupName]) =>
          this.gameService.getPokedexByName(pokedexName).pipe(
            tap((pokedex) => {
              this.pokedexEntriesStore.setPokedexEntries(pokedex.pokemon_entries);
              this.pokedexEntriesStore.loadPokemonSpecies();
              this.navService.setContext(versionGroupName, pokedex.pokemon_entries);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();

    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result.matches) {
          this.hidePageSize.set(true);
        } else {
          this.hidePageSize.set(false);
        }
      });
  }
}
