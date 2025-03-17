import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { ActivatedRoute } from "@angular/router";
import { VersionGroupStore } from "src/app/shared/store/version-group.store";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatTabsModule } from "@angular/material/tabs";
import { VersionGroupSelectComponent } from "../../components/version-group-select/version-group-select.component";
import { PokedexEntriesComponent } from "../../components/pokedex-entries/pokedex-entries.component";

@Component({
  imports: [
    MatPaginatorModule,
    MatProgressBarModule,
    MatTabsModule,
    VersionGroupSelectComponent,
    PokedexEntriesComponent,
  ],
  selector: "app-pokedex",
  templateUrl: "pokedex.component.html",
  styleUrl: "pokedex.component.scss",
})
export class PokedexComponent implements OnInit {
  readonly versionGroupStore = inject(VersionGroupStore);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _destroy$ = inject(DestroyRef);

  ngOnInit(): void {
    this._activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe((paramMap) => {
        const versionGroupName = paramMap.get("versionGroupName") || "";
        this.versionGroupStore.setSelectedVersionGroupByName(versionGroupName);
      });
  }
}
