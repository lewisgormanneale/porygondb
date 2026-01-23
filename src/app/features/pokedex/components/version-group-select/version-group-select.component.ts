import {
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from "@angular/core";
import { VersionGroupStore } from "../../../../shared/+state/version-group.store";
import { ActivatedRoute, Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "version-group-select",
  templateUrl: "version-group-select.component.html",
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule],
  styleUrls: ["version-group-select.component.scss"],
})
export class VersionGroupSelectComponent implements OnInit {
  selectedVersionGroupName = signal<string>("");
  versionGroupStore = inject(VersionGroupStore);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _destroy$ = inject(DestroyRef);

  ngOnInit(): void {
    this._activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe((paramMap) => {
        const versionGroupName = paramMap.get("versionGroupName") || "";
        this.selectedVersionGroupName.set(versionGroupName);
      });
  }

  navigateToVersionGroupPokedex(versionGroupName: string): void {
    void this._router.navigate(["/pokedex", versionGroupName]);
  }
}
