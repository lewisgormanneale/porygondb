import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { PokemonService } from '../../../../shared/services/pokemon.service';

interface AbilityListItem {
  name: string;
  displayName: string;
}

@Component({
  selector: 'app-abilities',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    RouterModule,
  ],
  templateUrl: './abilities.component.html',
  styleUrl: './abilities.component.scss',
})
export class AbilitiesComponent {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly searchValue = signal('');
  readonly abilities = signal<AbilityListItem[]>([]);
  readonly pageEvent = signal<PageEvent>({
    pageIndex: 0,
    pageSize: 50,
    length: 0,
  });

  readonly filteredAbilities = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    const entries = this.abilities();

    if (!query) {
      return entries;
    }

    return entries.filter(
      (entry) => entry.name.includes(query) || entry.displayName.toLowerCase().includes(query)
    );
  });

  readonly paginatedAbilities = computed(() => {
    const entries = this.filteredAbilities();
    const page = this.pageEvent();
    const start = page.pageIndex * page.pageSize;
    return entries.slice(start, start + page.pageSize);
  });

  constructor() {
    this.pokemonService
      .listAbilities(0, 10000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        const mapped = list.results
          .map((entry) => ({
            name: entry.name,
            displayName: this.formatName(entry.name),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.abilities.set(mapped);
        this.pageEvent.set({
          ...this.pageEvent(),
          length: mapped.length,
        });
        this.isLoading.set(false);
      });
  }

  onSearchInput(query: string): void {
    this.searchValue.set(query);
    this.pageEvent.set({
      ...this.pageEvent(),
      pageIndex: 0,
      length: this.filteredAbilities().length,
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageEvent.set({
      ...event,
      length: this.filteredAbilities().length,
    });
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
