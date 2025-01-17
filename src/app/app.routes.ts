import {Routes} from '@angular/router';
import {PokedexComponent} from "./pages/pokedex/pokedex.component";
import {PageNotFoundComponent} from "./pages/page-not-found/page-not-found.component";

export const routes: Routes = [
    {path: '', component: PokedexComponent},
    {path: '**', component: PageNotFoundComponent}
];