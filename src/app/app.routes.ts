import { Routes } from '@angular/router';
import { PokedexComponent } from './features/pokedex/pages/pokedex/pokedex.component';
import { PokemonComponent } from './features/pokemon/pages/pokemon/pokemon.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/pokedex/national/national', pathMatch: 'full' },
  { path: 'pokedex/:versionGroupName/:pokedexName', component: PokedexComponent },
  { path: 'pokedex/:versionGroupName/:pokedexName/:name', component: PokemonComponent },
  { path: '**', component: PageNotFoundComponent },
];
