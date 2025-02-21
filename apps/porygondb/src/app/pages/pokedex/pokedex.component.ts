import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PokedexResult, AppState, loadPokedex } from 'shared-data-access';
import { PokedexCardComponent } from 'pokedex-ui';

@Component({
  imports: [
    AsyncPipe,
    MatPaginatorModule,
    MatProgressBarModule,
    PokedexCardComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  selector: 'app-pokedex',
  templateUrl: 'pokedex.component.html',
  styleUrl: 'pokedex.component.scss',
})
export class PokedexComponent implements OnInit {
  pokedex$: Observable<PokedexResult[]>;
  totalCount$: Observable<number>;
  loading$: Observable<boolean>;
  pageIndex = 0;
  pageSize = 25;

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
