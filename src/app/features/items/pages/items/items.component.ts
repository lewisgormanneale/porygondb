import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { PokemonService } from '../../../../shared/services/pokemon.service';

const CATEGORY_DETAIL_CONCURRENCY = 8;
const ITEM_DETAIL_FETCH_CONCURRENCY = 8;

export const ALL_FILTER_VALUE = 'all';
export const FALLBACK_ITEM_SPRITE_URL = 'assets/images/question-mark.png';

interface FilterOption {
  name: string;
  displayName: string;
}

interface ItemDetailSummary {
  spriteUrl: string | null;
  displayName: string | null;
}

interface ItemListItem {
  name: string;
  displayName: string;
  categoryName: string;
  categoryDisplayName: string;
  pocketName: string;
  pocketDisplayName: string;
  attributeNames: string[];
  attributeDisplayNames: string[];
}

@Component({
  selector: 'app-items',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    RouterModule,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly ALL_FILTER_VALUE = ALL_FILTER_VALUE;
  readonly FALLBACK_ITEM_SPRITE_URL = FALLBACK_ITEM_SPRITE_URL;
  readonly displayedColumns = ['item', 'category', 'pocket', 'attributes'];

  readonly isLoading = signal(true);
  readonly searchValue = signal('');
  readonly selectedCategory = signal(ALL_FILTER_VALUE);
  readonly selectedPocket = signal(ALL_FILTER_VALUE);
  readonly selectedAttribute = signal(ALL_FILTER_VALUE);
  readonly items = signal<ItemListItem[]>([]);
  readonly categoryOptions = signal<FilterOption[]>([]);
  readonly pocketOptions = signal<FilterOption[]>([]);
  readonly attributeOptions = signal<FilterOption[]>([]);
  readonly itemDetailByName = signal<Record<string, ItemDetailSummary>>({});
  readonly pageEvent = signal<PageEvent>({
    pageIndex: 0,
    pageSize: 50,
    length: 0,
  });

  readonly filteredItems = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    const category = this.selectedCategory();
    const pocket = this.selectedPocket();
    const attribute = this.selectedAttribute();

    return this.items().filter((item) => {
      if (
        query &&
        !item.name.includes(query) &&
        !item.displayName.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (category !== ALL_FILTER_VALUE && item.categoryName !== category) {
        return false;
      }
      if (pocket !== ALL_FILTER_VALUE && item.pocketName !== pocket) {
        return false;
      }
      if (attribute !== ALL_FILTER_VALUE && !item.attributeNames.includes(attribute)) {
        return false;
      }
      return true;
    });
  });

  readonly paginatedItems = computed(() => {
    const entries = this.filteredItems();
    const page = this.pageEvent();
    const start = page.pageIndex * page.pageSize;
    return entries.slice(start, start + page.pageSize);
  });

  constructor() {
    forkJoin({
      items: this.pokemonService.listItems(0, 10000),
      categories: this.pokemonService.listItemCategories(0, 1000),
      attributes: this.pokemonService.listItemAttributes(0, 1000),
    })
      .pipe(
        switchMap(({ items, categories, attributes }) =>
          forkJoin({
            items: of(items),
            categoryDetails: from(categories.results).pipe(
              mergeMap(
                (category) => this.pokemonService.getItemCategoryByUrl(category.url),
                CATEGORY_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
            attributeDetails: from(attributes.results).pipe(
              mergeMap(
                (attribute) => this.pokemonService.getItemAttributeByUrl(attribute.url),
                CATEGORY_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ items, categoryDetails, attributeDetails }) => {
        const categoryByItemName = new Map<string, FilterOption>();
        const pocketByItemName = new Map<string, FilterOption>();
        const pocketOptionsByName = new Map<string, FilterOption>();
        const categoryOptions: FilterOption[] = [];

        for (const category of categoryDetails) {
          const categoryOption: FilterOption = {
            name: category.name,
            displayName: this.formatName(category.name),
          };
          categoryOptions.push(categoryOption);

          const pocketOption: FilterOption = {
            name: category.pocket.name,
            displayName: this.formatName(category.pocket.name),
          };
          pocketOptionsByName.set(pocketOption.name, pocketOption);

          for (const item of category.items) {
            categoryByItemName.set(item.name, categoryOption);
            pocketByItemName.set(item.name, pocketOption);
          }
        }

        const attributeByItemName = new Map<string, FilterOption[]>();
        const attributeOptions: FilterOption[] = [];

        for (const attribute of attributeDetails) {
          const attributeOption: FilterOption = {
            name: attribute.name,
            displayName: this.formatName(attribute.name),
          };
          attributeOptions.push(attributeOption);

          for (const item of attribute.items) {
            const existing = attributeByItemName.get(item.name) ?? [];
            existing.push(attributeOption);
            attributeByItemName.set(item.name, existing);
          }
        }

        const mapped: ItemListItem[] = items.results
          .map((entry) => {
            const category = categoryByItemName.get(entry.name);
            const pocket = pocketByItemName.get(entry.name);
            const attributes = attributeByItemName.get(entry.name) ?? [];

            return {
              name: entry.name,
              displayName: this.formatName(entry.name),
              categoryName: category?.name ?? '',
              categoryDisplayName: category?.displayName ?? 'Unknown',
              pocketName: pocket?.name ?? '',
              pocketDisplayName: pocket?.displayName ?? 'Unknown',
              attributeNames: attributes.map((attribute) => attribute.name),
              attributeDisplayNames: attributes.map((attribute) => attribute.displayName),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        this.items.set(mapped);
        this.categoryOptions.set(
          categoryOptions.sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
        this.pocketOptions.set(
          Array.from(pocketOptionsByName.values()).sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          )
        );
        this.attributeOptions.set(
          attributeOptions.sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
        this.pageEvent.set({
          ...this.pageEvent(),
          length: mapped.length,
        });
        this.isLoading.set(false);
      });

    // Only the currently visible page's item details are fetched (sprite and
    // proper English name), rather than guessing a sprite URL and formatting
    // a display name from the slug for every item up front.
    effect(() => {
      this.ensureItemDetailsLoaded(this.paginatedItems());
    });
  }

  onSearchInput(query: string): void {
    this.searchValue.set(query);
    this.resetToFirstPage();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.resetToFirstPage();
  }

  onPocketChange(pocket: string): void {
    this.selectedPocket.set(pocket);
    this.resetToFirstPage();
  }

  onAttributeChange(attribute: string): void {
    this.selectedAttribute.set(attribute);
    this.resetToFirstPage();
  }

  onPageChange(event: PageEvent): void {
    this.pageEvent.set({
      ...event,
      length: this.filteredItems().length,
    });
  }

  onSpriteError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_ITEM_SPRITE_URL;
  }

  private ensureItemDetailsLoaded(pageItems: ItemListItem[]): void {
    const cache = this.itemDetailByName();
    const pending = pageItems.filter((item) => !(item.name in cache));
    if (pending.length === 0) {
      return;
    }

    from(pending)
      .pipe(
        mergeMap(
          (item) =>
            this.pokemonService.getItemByName(item.name).pipe(
              map((detail) => ({
                name: item.name,
                spriteUrl: detail.sprites.default,
                displayName: detail.names.find((entry) => entry.language.name === 'en')?.name ?? null,
              })),
              catchError(() => of({ name: item.name, spriteUrl: null, displayName: null }))
            ),
          ITEM_DETAIL_FETCH_CONCURRENCY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ name, spriteUrl, displayName }) => {
        this.itemDetailByName.update((current) => ({
          ...current,
          [name]: { spriteUrl, displayName },
        }));
      });
  }

  private resetToFirstPage(): void {
    this.pageEvent.set({
      ...this.pageEvent(),
      pageIndex: 0,
      length: this.filteredItems().length,
    });
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
