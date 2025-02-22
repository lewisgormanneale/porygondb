import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PokedexCardComponent } from 'pokedex-ui';
import { PokemonStore } from 'pokemon-data-access';
import { PokedexStore } from 'shared-data-access';
import { ActivatedRoute } from '@angular/router';

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
  providers: [PokedexStore],
})
export class PokedexComponent implements OnInit {
  readonly pokedexStore = inject(PokedexStore);
  pokedexName: string;
  pageIndex = 0;
  pageSize = 25;

  constructor(private route: ActivatedRoute) {
    this.pokedexName = this.route.snapshot.paramMap.get('name') || '';
  }

  ngOnInit(): void {
    this.pokedexStore.listAllPokedexes();
  }

  onPageChange(event: PageEvent): void {
    // this.pageIndex = event.pageIndex;
    // this.pageSize = event.pageSize;
    // const offset = this.pageIndex * this.pageSize;
    // this.store.dispatch(loadPokedex({ offset, limit: this.pageSize }));
  }
}
