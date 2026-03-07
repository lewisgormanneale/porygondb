import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { VersionGroupSelectComponent } from '../../components/version-group-select/version-group-select.component';
import { PokedexEntriesComponent } from '../../components/pokedex-entries/pokedex-entries.component';
import { VersionGroupStore } from '../../../../shared/+state/version-group.store';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  imports: [
    MatTabsModule,
    VersionGroupSelectComponent,
    PokedexEntriesComponent,
    MatProgressBarModule,
  ],
  selector: 'app-pokedex',
  templateUrl: 'pokedex.component.html',
  styleUrl: 'pokedex.component.scss',
})
export class PokedexComponent implements OnInit {
  readonly versionGroupStore = inject(VersionGroupStore);
  readonly selectedPokedexIndex = signal(0);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroy$ = inject(DestroyRef);

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(takeUntilDestroyed(this._destroy$)).subscribe((paramMap) => {
      const versionGroupName = paramMap.get('versionGroupName') || '';
      const pokedexName = paramMap.get('pokedexName') || '';

      this.versionGroupStore.setSelectedVersionGroupByName(versionGroupName);

      const versionGroup = this.versionGroupStore.entities().find((entry) => entry.name === versionGroupName);
      if (!versionGroup || versionGroup.pokedexes.length === 0) {
        this.selectedPokedexIndex.set(0);
        return;
      }

      const fallbackPokedex = versionGroup.pokedexes[0];
      const selectedPokedex =
        versionGroup.pokedexes.find((entry) => entry.name === pokedexName) ?? fallbackPokedex;

      const selectedIndex = versionGroup.pokedexes.findIndex(
        (entry) => entry.name === selectedPokedex.name
      );
      this.selectedPokedexIndex.set(selectedIndex >= 0 ? selectedIndex : 0);

      if (pokedexName !== selectedPokedex.name) {
        void this._router.navigate(['/pokedex', versionGroupName, selectedPokedex.name], {
          replaceUrl: true,
        });
      }
    });
  }

  onSelectedPokedexTabChange(index: number): void {
    const versionGroup = this.versionGroupStore.selectedEntity();
    const selectedPokedex = versionGroup?.pokedexes[index];

    if (!versionGroup || !selectedPokedex) {
      return;
    }

    this.selectedPokedexIndex.set(index);
    void this._router.navigate(['/pokedex', versionGroup.name, selectedPokedex.name]);
  }
}
