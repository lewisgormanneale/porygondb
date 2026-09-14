import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { Ability, Generation, NamedAPIResourceList } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { AbilitiesComponent } from './abilities.component';

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

describe('AbilitiesComponent', () => {
  const listAbilitiesMock = vi.fn();
  const listGenerationsMock = vi.fn();
  const getGenerationByUrlMock = vi.fn();
  const getAbilityByNameMock = vi.fn();

  const pokemonServiceStub = {
    listAbilities: listAbilitiesMock,
    listGenerations: listGenerationsMock,
    getGenerationByUrl: getGenerationByUrlMock,
    getAbilityByName: getAbilityByNameMock,
  };

  const breakpointState$ = new BehaviorSubject<{ matches: boolean }>({ matches: false });
  const breakpointObserverStub = {
    observe: vi.fn(() => breakpointState$.asObservable()),
  };
  const testProviders = [
    provideRouter([]),
    provideLocationMocks(),
    { provide: PokemonService, useValue: pokemonServiceStub },
    { provide: BreakpointObserver, useValue: breakpointObserverStub },
  ];

  function setUp(): void {
    breakpointState$.next({ matches: false });
    listAbilitiesMock.mockReturnValue(
      of(createResourceList(['stench', 'adaptability', 'overgrow'], 'ability'))
    );
    listGenerationsMock.mockReturnValue(
      of(createResourceList(['generation-i', 'generation-iii'], 'generation'))
    );

    const generations: Record<string, Generation> = {
      // Real PokeAPI data never lists abilities under Generation I (they
      // weren't introduced as a mechanic until Generation III), but this
      // ability entry exercises that the component excludes it anyway.
      'https://pokeapi.co/api/v2/generation/1/': {
        id: 1,
        name: 'generation-i',
        abilities: [{ name: 'stench', url: 'https://pokeapi.co/api/v2/ability/1/' }],
        names: [],
        main_region: { name: 'kanto', url: 'https://pokeapi.co/api/v2/region/1/' },
        moves: [],
        pokemon_species: [],
        types: [],
        version_groups: [],
      },
      'https://pokeapi.co/api/v2/generation/2/': {
        id: 3,
        name: 'generation-iii',
        abilities: [
          { name: 'adaptability', url: 'https://pokeapi.co/api/v2/ability/91/' },
          { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
        ],
        names: [],
        main_region: { name: 'hoenn', url: 'https://pokeapi.co/api/v2/region/3/' },
        moves: [],
        pokemon_species: [],
        types: [],
        version_groups: [],
      },
    };
    getGenerationByUrlMock.mockImplementation((url: string) => of(generations[url]));

    getAbilityByNameMock.mockImplementation((name: string) =>
      of({
        names: [],
        flavor_text_entries: [
          {
            flavor_text: `${name} in-game description`,
            language: { name: 'en', url: '' },
            version_group: { name: 'red-blue', url: '' },
          },
        ],
      } as unknown as Ability)
    );
  }

  it('loads abilities and maps generation filter data', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.abilities().map((entry) => entry.name)).toEqual([
      'adaptability',
      'overgrow',
      'stench',
    ]);

    const adaptability = fixture.componentInstance
      .abilities()
      .find((entry) => entry.name === 'adaptability');
    expect(adaptability?.generationDisplayName).toBe('Generation III');

    expect(fixture.componentInstance.generationOptions().map((option) => option.name)).toEqual([
      'generation-iii',
    ]);

    const hostElement: HTMLElement = fixture.nativeElement;
    const links = Array.from(hostElement.querySelectorAll('a[href^="/abilities/"]'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Adaptability',
      'Overgrow',
      'Stench',
    ]);
  });

  it('filters abilities from search input and resets to first page', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.componentInstance.onPageChange({
      pageIndex: 1,
      pageSize: 25,
      length: 3,
      previousPageIndex: 0,
    });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'grow';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.pageEvent().pageIndex).toBe(0);
    expect(fixture.componentInstance.filteredAbilities().map((entry) => entry.name)).toEqual([
      'overgrow',
    ]);
  });

  it('filters abilities by generation', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    fixture.componentInstance.onGenerationChange('generation-iii');

    expect(fixture.componentInstance.filteredAbilities().map((entry) => entry.name)).toEqual([
      'adaptability',
      'overgrow',
    ]);
  });

  it('excludes Generations I and II from the Introduced In filter, since abilities did not exist yet', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.generationOptions().map((option) => option.name)).toEqual([
      'generation-iii',
    ]);

    const stench = fixture.componentInstance.abilities().find((entry) => entry.name === 'stench');
    expect(stench?.generationDisplayName).toBe('Unknown');
  });

  it('updates pagination state and paginated entries on page change', () => {
    const names = Array.from(
      { length: 60 },
      (_, index) => `ability-${String(index + 1).padStart(3, '0')}`
    );
    listAbilitiesMock.mockReturnValue(of(createResourceList(names, 'ability')));
    listGenerationsMock.mockReturnValue(of(createResourceList([], 'generation')));
    getAbilityByNameMock.mockReturnValue(
      of({ names: [], flavor_text_entries: [] } as unknown as Ability)
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    fixture.componentInstance.onPageChange({
      pageIndex: 1,
      pageSize: 25,
      length: 60,
      previousPageIndex: 0,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.pageEvent().pageIndex).toBe(1);
    expect(fixture.componentInstance.paginatedAbilities()).toHaveLength(25);
    expect(fixture.componentInstance.paginatedAbilities()[0].name).toBe('ability-026');
  });

  it('lazily fetches ability details only for abilities on the visible page, and caches them', () => {
    setUp();
    getAbilityByNameMock.mockClear();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    expect(getAbilityByNameMock).toHaveBeenCalledTimes(3);
    expect(fixture.componentInstance.getAbilityDetails('stench')?.description).toBe(
      'stench in-game description'
    );

    fixture.detectChanges();

    expect(getAbilityByNameMock).toHaveBeenCalledTimes(3);
  });

  it('swaps the slug-based name for the proper English name once fetched', () => {
    setUp();
    getAbilityByNameMock.mockImplementation((name: string) =>
      of({
        names: name === 'stench' ? [{ name: 'Stink', language: { name: 'en', url: '' } }] : [],
        flavor_text_entries: [],
      } as unknown as Ability)
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.getAbilityDetails('stench')?.displayName).toBe('Stink');

    const hostElement: HTMLElement = fixture.nativeElement;
    const links = Array.from(hostElement.querySelectorAll('a[href^="/abilities/"]'));
    expect(links.map((link) => link.textContent?.trim())).toContain('Stink');
  });

  it('defaults filters to expanded on larger screens and collapsed on handsets', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: testProviders,
    }).createComponent(AbilitiesComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.filtersExpanded()).toBe(true);

    breakpointState$.next({ matches: true });
    expect(fixture.componentInstance.filtersExpanded()).toBe(false);
  });
});
