import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "../../store/app.state";
import {loadPokedex} from "../../store/actions/pokedex.actions";
import {PokedexResult} from "../../models/pokedex.model";
import {AsyncPipe} from "@angular/common";

@Component({
    selector: 'app-pokedex',
    imports: [
        AsyncPipe
    ],
    templateUrl: 'pokedex.component.html',
})
export class PokedexComponent implements OnInit {
    pokedex$: Observable<PokedexResult[]>;

    constructor(private store: Store<AppState>) {
        this.pokedex$ = this.store.select(state => state.pokedex.pokedex);
    }

    ngOnInit(): void {
        this.store.dispatch(loadPokedex());
    }
}
