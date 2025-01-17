import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../../store/app.state";
import {loadPokedex} from "../../store/actions/pokedex.actions";
import {PokedexResult} from "../../models/pokedex.model";
import {AsyncPipe} from "@angular/common";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardImage} from "@angular/material/card";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-pokedex',
    imports: [
        AsyncPipe,
        MatPaginator,
        MatGridListModule,
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatButton,
        MatCardImage,
        MatIcon,
        MatIconButton
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
    }

    ngOnInit(): void {
        this.store.dispatch(loadPokedex({offset: 0, limit: 50}));
    }

    onPageChange(event: PageEvent): void {
        const offset = event.pageIndex * event.pageSize;
        this.store.dispatch(loadPokedex({offset, limit: event.pageSize}));
    }
}
