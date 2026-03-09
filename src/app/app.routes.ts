import { Routes } from '@angular/router';
import { PokedexComponent } from './features/pokedex/pages/pokedex/pokedex.component';
import { PokemonComponent } from './features/pokemon/pages/pokemon/pokemon.component';
import { AbilitiesComponent } from './features/abilities/pages/abilities/abilities.component';
import { AbilityComponent } from './features/abilities/pages/ability/ability.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/pokedex/national/national', pathMatch: 'full' },
  { path: 'abilities', component: AbilitiesComponent },
  { path: 'abilities/:name', component: AbilityComponent },
  { path: 'pokedex/:versionGroupName/:pokedexName', component: PokedexComponent },
  { path: 'pokedex/:versionGroupName/:pokedexName/:name', component: PokemonComponent },
  { path: '**', component: PageNotFoundComponent },
];
