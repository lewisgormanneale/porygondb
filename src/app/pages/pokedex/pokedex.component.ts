import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../../store/app.state";
import {loadPokedex} from "../../store/actions/pokedex.actions";
import {PokedexResult} from "../../models/pokedex.model";
import {AsyncPipe} from "@angular/common";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";

@Component({
    selector: 'app-pokedex',
    imports: [
        AsyncPipe,
        MatPaginator,
        MatGridList,
        MatGridTile
    ],
    templateUrl: 'pokedex.component.html',
    styleUrl: 'pokedex.component.scss'
})
export class PokedexComponent implements OnInit {
    pokedex$: Observable<PokedexResult[]>;
    totalCount$: Observable<number>;

    constructor(private store: Store<AppState>) {
        this.pokedex$ = this.store.select(state => state.pokedex.pokedex);
        this.totalCount$ = this.store.select(state => state.pokedex.totalCount);
        console.log(this.pokedex$);
        console.log(this.totalCount$);
    }

    ngOnInit(): void {
        this.store.dispatch(loadPokedex({offset: 0, limit: 50}));
    }

    onPageChange(event: PageEvent): void {
        const offset = event.pageIndex * event.pageSize;
        this.store.dispatch(loadPokedex({offset, limit: event.pageSize}));
    }
}
