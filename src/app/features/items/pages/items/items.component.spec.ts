import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ItemCategory, ItemAttribute, NamedAPIResourceList } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { ItemsComponent } from './items.component';

function createResourceList(names: string[], kind: string): NamedAPIResourceList {
  return {
    count: names.length,
    next: null,
    previous: null,
    results: names.map((name, index) => ({
      name,
      url: `https://pokeapi.co/api/v2/${kind}/${index + 1}/`,
    })),
  };
}

describe('ItemsComponent', () => {
  const listItemsMock = vi.fn();
  const listItemCategoriesMock = vi.fn();
  const listItemAttributesMock = vi.fn();
  const getItemCategoryByUrlMock = vi.fn();
  const getItemAttributeByUrlMock = vi.fn();

  const pokemonServiceStub = {
    listItems: listItemsMock,
    listItemCategories: listItemCategoriesMock,
    listItemAttributes: listItemAttributesMock,
    getItemCategoryByUrl: getItemCategoryByUrlMock,
    getItemAttributeByUrl: getItemAttributeByUrlMock,
  };

  function setUp(): void {
    listItemsMock.mockReturnValue(
      of(createResourceList(['poke-ball', 'potion', 'rare-candy'], 'item'))
    );
    listItemCategoriesMock.mockReturnValue(of(createResourceList(['standard-balls', 'medicine'], 'item-category')));
    listItemAttributesMock.mockReturnValue(of(createResourceList(['holdable'], 'item-attribute')));

    const categories: Record<string, ItemCategory> = {
      'https://pokeapi.co/api/v2/item-category/1/': {
        id: 1,
        name: 'standard-balls',
        pocket: { name: 'poke-balls', url: 'https://pokeapi.co/api/v2/item-pocket/1/' },
        names: [],
        items: [{ name: 'poke-ball', url: 'https://pokeapi.co/api/v2/item/4/' }],
      },
      'https://pokeapi.co/api/v2/item-category/2/': {
        id: 2,
        name: 'medicine',
        pocket: { name: 'medicine', url: 'https://pokeapi.co/api/v2/item-pocket/2/' },
        names: [],
        items: [
          { name: 'potion', url: 'https://pokeapi.co/api/v2/item/17/' },
          { name: 'rare-candy', url: 'https://pokeapi.co/api/v2/item/50/' },
        ],
      },
    };
    getItemCategoryByUrlMock.mockImplementation((url: string) => of(categories[url]));

    const attributes: Record<string, ItemAttribute> = {
      'https://pokeapi.co/api/v2/item-attribute/1/': {
        id: 1,
        name: 'holdable',
        names: [],
        descriptions: [],
        items: [{ name: 'rare-candy', url: 'https://pokeapi.co/api/v2/item/50/' }],
      },
    };
    getItemAttributeByUrlMock.mockImplementation((url: string) => of(attributes[url]));
  }

  it('loads items and maps category, pocket and attribute filter data', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemsComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.items().map((item) => item.name)).toEqual([
      'poke-ball',
      'potion',
      'rare-candy',
    ]);

    const rareCandy = fixture.componentInstance.items().find((item) => item.name === 'rare-candy');
    expect(rareCandy?.categoryDisplayName).toBe('Medicine');
    expect(rareCandy?.pocketDisplayName).toBe('Medicine');
    expect(rareCandy?.attributeDisplayNames).toEqual(['Holdable']);

    expect(fixture.componentInstance.categoryOptions().map((option) => option.name)).toEqual(
      expect.arrayContaining(['standard-balls', 'medicine'])
    );
    expect(fixture.componentInstance.pocketOptions().map((option) => option.name)).toEqual(
      expect.arrayContaining(['poke-balls', 'medicine'])
    );

    const hostElement: HTMLElement = fixture.nativeElement;
    const links = Array.from(hostElement.querySelectorAll('a[href^="/items/"]'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Poke Ball',
      'Potion',
      'Rare Candy',
    ]);
  });

  it('filters items by search text and resets to first page', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemsComponent);

    fixture.detectChanges();

    fixture.componentInstance.onPageChange({
      pageIndex: 1,
      pageSize: 25,
      length: 3,
      previousPageIndex: 0,
    });
    fixture.componentInstance.onSearchInput('candy');

    expect(fixture.componentInstance.pageEvent().pageIndex).toBe(0);
    expect(fixture.componentInstance.filteredItems().map((item) => item.name)).toEqual([
      'rare-candy',
    ]);
  });

  it('filters items by category', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemsComponent);

    fixture.detectChanges();

    fixture.componentInstance.onCategoryChange('standard-balls');

    expect(fixture.componentInstance.filteredItems().map((item) => item.name)).toEqual([
      'poke-ball',
    ]);
  });

  it('filters items by attribute', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [ItemsComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemsComponent);

    fixture.detectChanges();

    fixture.componentInstance.onAttributeChange('holdable');

    expect(fixture.componentInstance.filteredItems().map((item) => item.name)).toEqual([
      'rare-candy',
    ]);
  });
});
