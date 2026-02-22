import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _destroy$ = inject(DestroyRef);

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(takeUntilDestroyed(this._destroy$)).subscribe((paramMap) => {
      const versionGroupName = paramMap.get('versionGroupName') || '';
      this.versionGroupStore.setSelectedVersionGroupByName(versionGroupName);
    });
  }
}
