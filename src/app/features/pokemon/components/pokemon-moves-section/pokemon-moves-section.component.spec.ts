import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { PageEvent } from '@angular/material/paginator';
import { PokemonMovesSectionComponent } from './pokemon-moves-section.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ThemeStore } from '../../../../core/+state/theme.store';

describe('PokemonMovesSectionComponent', () => {
  let fixture: ComponentFixture<PokemonMovesSectionComponent>;
  let component: PokemonMovesSectionComponent;

  const selectedEntitySignal = signal<any>(undefined);
  const getMoveByNameMock = vi.fn();
  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
  };
  const pokemonServiceStub = {
    getMoveByName: getMoveByNameMock,
  };
  const themeStoreStub = {
    isDarkTheme: () => false,
  };

  const buildPageEvent = (pageIndex: number): PageEvent => ({
    pageIndex,
    pageSize: 10,
    length: 100,
    previousPageIndex: pageIndex > 0 ? pageIndex - 1 : 0,
  });

  const createMove = (name: string, method: string, level: number, versionGroup = 'red-blue') => ({
    move: { name },
    version_group_details: [
      {
        version_group: { name: versionGroup },
        move_learn_method: { name: method },
        level_learned_at: level,
      },
    ],
  });

  beforeEach(async () => {
    getMoveByNameMock.mockImplementation((name: string) =>
      of({
        id: 1,
        name,
        accuracy: 100,
        power: 90,
        pp: 15,
        type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' },
        damage_class: { name: 'special', url: 'https://pokeapi.co/api/v2/move-damage-class/3/' },
      })
    );

    await TestBed.configureTestingModule({
      imports: [PokemonMovesSectionComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonMovesSectionComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('builds method tabs dynamically with priority order', () => {
    selectedEntitySignal.set({
      moves: [
        createMove('thunderbolt', 'machine', 0),
        createMove('quick-attack', 'level-up', 10),
        createMove('double-team', 'tutor', 0),
      ],
    });

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    const tabs = component.moveMethodTabs();
    expect(tabs.map((tab) => tab.key)).toEqual(['level-up', 'machine', 'tutor']);
    expect(tabs.map((tab) => tab.label)).toEqual(['Level Up', 'TM/HMs', 'Tutor']);
  });

  it('paginates rows with page size 10', () => {
    const levelMoves = Array.from({ length: 14 }, (_, index) =>
      createMove(`move-${index + 1}`, 'level-up', index + 1)
    );

    selectedEntitySignal.set({ moves: levelMoves });
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    const levelTab = component.moveMethodTabs().find((tab) => tab.key === 'level-up');
    expect(levelTab).toBeTruthy();

    const firstPage = component.getPaginatedRows('level-up', levelTab!.moves);
    expect(firstPage).toHaveLength(10);

    component.onMethodPageChange('level-up', buildPageEvent(1));
    fixture.detectChanges();

    const secondPage = component.getPaginatedRows('level-up', levelTab!.moves);
    expect(secondPage).toHaveLength(4);
  });

  it('clamps stale page index when move counts shrink', () => {
    const manyMachineMoves = Array.from({ length: 25 }, (_, index) =>
      createMove(`tm-${index + 1}`, 'machine', 0)
    );
    selectedEntitySignal.set({ moves: manyMachineMoves });

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    component.onMethodPageChange('machine', buildPageEvent(2));
    fixture.detectChanges();
    expect(component.getPageIndex('machine')).toBe(2);

    selectedEntitySignal.set({
      moves: [createMove('tm-small', 'machine', 0)],
    });
    fixture.detectChanges();

    expect(component.getPageIndex('machine')).toBe(0);
  });

  it('loads and caches metadata for currently visible moves', () => {
    selectedEntitySignal.set({
      moves: [
        createMove('thunderbolt', 'machine', 0),
        createMove('quick-attack', 'level-up', 10),
      ],
    });

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(getMoveByNameMock).toHaveBeenCalled();

    const visibleMoveDetails = component.getMoveDetails('quick-attack');
    expect(visibleMoveDetails?.typeName).toBe('Electric');
    expect(visibleMoveDetails?.damageClassName).toBe('Special');
    expect(visibleMoveDetails?.pp).toBe(15);
    expect(visibleMoveDetails?.power).toBe(90);
    expect(visibleMoveDetails?.accuracy).toBe(100);

    expect(fixture.nativeElement.querySelector('type-chip')).not.toBeNull();
  });
});
