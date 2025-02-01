import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../store/app.state";
import { loadPokedex } from "../../store/actions/pokedex.actions";
import { PokedexResult } from "../../models/pokedex.model";
import { AsyncPipe } from "@angular/common";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { PokedexCardComponent } from "./components/pokedex-card/pokedex-card.component";

@Component({
  selector: "app-pokedex",
  imports: [
    AsyncPipe,
    MatPaginatorModule,
    MatProgressBarModule,
    PokedexCardComponent,
  ],
  templateUrl: "pokedex.component.html",
  styleUrl: "pokedex.component.scss",
})
export class PokedexComponent implements OnInit {
  pokedex$: Observable<PokedexResult[]>;
  totalCount$: Observable<number>;
  loading$: Observable<boolean>;
  pageIndex: number = 0;
  pageSize: number = 25;

  constructor(private store: Store<AppState>) {
    this.pokedex$ = this.store.select((state) => state.pokedex.pokedex);
    this.totalCount$ = this.store.select((state) => state.pokedex.totalCount);
    this.loading$ = this.store.select((state) => state.pokedex.loading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadPokedex({ offset: 0, limit: 25 }));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    const offset = this.pageIndex * this.pageSize;
    this.store.dispatch(loadPokedex({ offset, limit: this.pageSize }));
  }
}
