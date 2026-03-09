import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { ThemeStore } from './core/+state/theme.store';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { PokemonService } from './shared/services/pokemon.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NATIONAL_POKEDEX_NAME,
  NATIONAL_VERSION_GROUP_NAME,
} from './shared/+state/data/version-group.constants';

interface PokemonSearchOption {
  name: string;
  displayName: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    OverlayModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'porygondb';
  isOverlayOpen: boolean = false;
  themeStore = inject(ThemeStore);
  private readonly pokemonService = inject(PokemonService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  searchValue = '';
  allPokemonOptions = signal<PokemonSearchOption[]>([]);
  filteredPokemonOptions = signal<PokemonSearchOption[]>([]);

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
    );
  }

  ngOnInit(): void {
    // Load all Pokemon names for autocomplete
    this.pokemonService
      .listPokemonSpecies(0, 10000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        const options = list.results.map((species) => ({
          name: species.name,
          displayName: this.formatPokemonName(species.name),
        }));
        this.allPokemonOptions.set(options);
      });
  }

  onSearchInput(): void {
    const query = this.searchValue.toLowerCase().trim();
    if (!query) {
      this.filteredPokemonOptions.set([]);
      return;
    }

    const filtered = this.allPokemonOptions()
      .filter(
        (option) => option.name.includes(query) || option.displayName.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limit to 10 results

    this.filteredPokemonOptions.set(filtered);
  }

  onPokemonSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedName = event.option.value;
    this.searchValue = '';
    this.filteredPokemonOptions.set([]);
    void this.router.navigate([
      '/pokedex',
      NATIONAL_VERSION_GROUP_NAME,
      NATIONAL_POKEDEX_NAME,
      selectedName,
    ]);
  }

  displayFn(name: string): string {
    return name ? this.formatPokemonName(name) : '';
  }

  private formatPokemonName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
