import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import {
  Generation,
  Move,
  MoveDamageClass,
  NamedAPIResourceList,
  Type,
} from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { ThemeStore } from '../../../../core/+state/theme.store';
import { MovesComponent } from './moves.component';

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

describe('MovesComponent', () => {
  const listMovesMock = vi.fn();
  const listTypesMock = vi.fn();
  const listMoveDamageClassesMock = vi.fn();
  const listGenerationsMock = vi.fn();
  const getTypeByUrlMock = vi.fn();
  const getMoveDamageClassByUrlMock = vi.fn();
  const getGenerationByUrlMock = vi.fn();
  const getMoveByNameMock = vi.fn();

  const pokemonServiceStub = {
    listMoves: listMovesMock,
    listTypes: listTypesMock,
    listMoveDamageClasses: listMoveDamageClassesMock,
    listGenerations: listGenerationsMock,
    getTypeByUrl: getTypeByUrlMock,
    getMoveDamageClassByUrl: getMoveDamageClassByUrlMock,
    getGenerationByUrl: getGenerationByUrlMock,
    getMoveByName: getMoveByNameMock,
  };

  const themeStoreStub = {
    isDarkTheme: () => false,
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
    { provide: ThemeStore, useValue: themeStoreStub },
  ];

  function setUp(): void {
    breakpointState$.next({ matches: false });
    listMovesMock.mockReturnValue(
      of(createResourceList(['tackle', 'thunderbolt', 'swords-dance'], 'move'))
    );
    listTypesMock.mockReturnValue(of(createResourceList(['normal', 'electric'], 'type')));
    listMoveDamageClassesMock.mockReturnValue(
      of(createResourceList(['physical', 'special', 'status'], 'move-damage-class'))
    );

    const types: Record<string, Type> = {
      'https://pokeapi.co/api/v2/type/1/': {
        name: 'normal',
        moves: [{ name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' }],
      } as unknown as Type,
      'https://pokeapi.co/api/v2/type/2/': {
        name: 'electric',
        moves: [{ name: 'thunderbolt', url: 'https://pokeapi.co/api/v2/move/85/' }],
      } as unknown as Type,
    };
    getTypeByUrlMock.mockImplementation((url: string) => of(types[url]));

    const damageClasses: Record<string, MoveDamageClass> = {
      'https://pokeapi.co/api/v2/move-damage-class/1/': {
        id: 1,
        name: 'physical',
        descriptions: [],
        names: [],
        moves: [{ name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' }],
      },
      'https://pokeapi.co/api/v2/move-damage-class/2/': {
        id: 2,
        name: 'special',
        descriptions: [],
        names: [],
        moves: [{ name: 'thunderbolt', url: 'https://pokeapi.co/api/v2/move/85/' }],
      },
      'https://pokeapi.co/api/v2/move-damage-class/3/': {
        id: 3,
        name: 'status',
        descriptions: [],
        names: [],
        moves: [{ name: 'swords-dance', url: 'https://pokeapi.co/api/v2/move/14/' }],
      },
    };
    getMoveDamageClassByUrlMock.mockImplementation((url: string) => of(damageClasses[url]));

    listGenerationsMock.mockReturnValue(
      of(createResourceList(['generation-i', 'generation-iv'], 'generation'))
    );

    const generations: Record<string, Generation> = {
      'https://pokeapi.co/api/v2/generation/1/': {
        id: 1,
        name: 'generation-i',
        abilities: [],
        names: [],
        main_region: { name: 'kanto', url: '' },
        moves: [{ name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' }],
        pokemon_species: [],
        types: [],
        version_groups: [],
      },
      'https://pokeapi.co/api/v2/generation/2/': {
        id: 4,
        name: 'generation-iv',
        abilities: [],
        names: [],
        main_region: { name: 'sinnoh', url: '' },
        moves: [{ name: 'swords-dance', url: 'https://pokeapi.co/api/v2/move/14/' }],
        pokemon_species: [],
        types: [],
        version_groups: [],
      },
    };
    getGenerationByUrlMock.mockImplementation((url: string) => of(generations[url]));

    getMoveByNameMock.mockImplementation(() =>
      of({ power: 40, accuracy: 100, pp: 35 } as unknown as Move)
    );
  }

  it('loads moves and maps type and category filter data', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.moves().map((move) => move.name)).toEqual([
      'swords-dance',
      'tackle',
      'thunderbolt',
    ]);

    const thunderbolt = fixture.componentInstance
      .moves()
      .find((move) => move.name === 'thunderbolt');
    expect(thunderbolt?.typeDisplayName).toBe('Electric');
    expect(thunderbolt?.damageClassDisplayName).toBe('Special');

    expect(fixture.componentInstance.typeOptions().map((option) => option.name)).toEqual(
      expect.arrayContaining(['normal', 'electric'])
    );
    expect(fixture.componentInstance.damageClassOptions().map((option) => option.name)).toEqual(
      expect.arrayContaining(['physical', 'special', 'status'])
    );

    const hostElement: HTMLElement = fixture.nativeElement;
    const links = Array.from(hostElement.querySelectorAll('a[href^="/moves/"]'));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Swords Dance',
      'Tackle',
      'Thunderbolt',
    ]);
  });

  it('filters moves by search text and resets to first page', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    fixture.componentInstance.onPageChange({
      pageIndex: 1,
      pageSize: 25,
      length: 3,
      previousPageIndex: 0,
    });
    fixture.componentInstance.onSearchInput('thunder');

    expect(fixture.componentInstance.pageEvent().pageIndex).toBe(0);
    expect(fixture.componentInstance.filteredMoves().map((move) => move.name)).toEqual([
      'thunderbolt',
    ]);
  });

  it('filters moves by type', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    fixture.componentInstance.onTypeChange('electric');

    expect(fixture.componentInstance.filteredMoves().map((move) => move.name)).toEqual([
      'thunderbolt',
    ]);
  });

  it('filters moves by damage class', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    fixture.componentInstance.onDamageClassChange('status');

    expect(fixture.componentInstance.filteredMoves().map((move) => move.name)).toEqual([
      'swords-dance',
    ]);
  });

  it('filters moves by generation and sorts generation options numerically', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    expect(
      fixture.componentInstance.generationOptions().map((option) => option.displayName)
    ).toEqual(['Generation I', 'Generation IV']);

    fixture.componentInstance.onGenerationChange('generation-iv');

    expect(fixture.componentInstance.filteredMoves().map((move) => move.name)).toEqual([
      'swords-dance',
    ]);
  });

  it('lazily fetches move details only for moves on the visible page, and caches them', () => {
    setUp();
    getMoveByNameMock.mockClear();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    expect(getMoveByNameMock).toHaveBeenCalledTimes(3);
    expect(fixture.componentInstance.getMoveDetails('tackle')?.power).toBe(40);

    fixture.detectChanges();

    expect(getMoveByNameMock).toHaveBeenCalledTimes(3);
  });

  it('defaults filters to expanded on larger screens and collapsed on handsets', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.filtersExpanded()).toBe(true);

    breakpointState$.next({ matches: true });
    expect(fixture.componentInstance.filtersExpanded()).toBe(false);
  });

  it('toggles the filters panel and tracks the active filter count', () => {
    setUp();

    const fixture = TestBed.configureTestingModule({
      imports: [MovesComponent],
      providers: testProviders,
    }).createComponent(MovesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.activeFilterCount()).toBe(0);

    fixture.componentInstance.toggleFilters();
    expect(fixture.componentInstance.filtersExpanded()).toBe(false);

    fixture.componentInstance.onTypeChange('electric');
    fixture.componentInstance.onDamageClassChange('special');
    fixture.componentInstance.onGenerationChange('generation-i');
    expect(fixture.componentInstance.activeFilterCount()).toBe(3);
  });
});
