import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { NamedAPIResourceList } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { AbilitiesComponent } from './abilities.component';

function createAbilityList(names: string[]): NamedAPIResourceList {
  return {
    count: names.length,
    next: null,
    previous: null,
    results: names.map((name, index) => ({
      name,
      url: `https://pokeapi.co/api/v2/ability/${index + 1}/`,
    })),
  };
}

describe('AbilitiesComponent', () => {
  const listAbilitiesMock = vi.fn();
  const pokemonServiceStub = {
    listAbilities: listAbilitiesMock,
  };

  it('creates and renders alphabetically sorted ability links', () => {
    listAbilitiesMock.mockReturnValue(
      of(createAbilityList(['stench', 'adaptability', 'overgrow']))
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilitiesComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.pageEvent().length).toBe(3);
    expect(fixture.componentInstance.paginatedAbilities().map((entry) => entry.name)).toEqual([
      'adaptability',
      'overgrow',
      'stench',
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
    listAbilitiesMock.mockReturnValue(
      of(createAbilityList(['stench', 'adaptability', 'overgrow']))
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
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

    const hostElement: HTMLElement = fixture.nativeElement;
    const links = Array.from(hostElement.querySelectorAll('a[href^="/abilities/"]'));
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Overgrow']);
  });

  it('updates pagination state and paginated entries on page change', () => {
    const names = Array.from(
      { length: 60 },
      (_, index) => `ability-${String(index + 1).padStart(3, '0')}`
    );
    listAbilitiesMock.mockReturnValue(of(createAbilityList(names)));

    const fixture = TestBed.configureTestingModule({
      imports: [AbilitiesComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
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
});
