import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PokemonMovesSectionComponent } from './pokemon-moves-section.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('PokemonMovesSectionComponent', () => {
  let fixture: ComponentFixture<PokemonMovesSectionComponent>;
  let component: PokemonMovesSectionComponent;

  const selectedEntitySignal = signal<any>(undefined);
  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
  };

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
    await TestBed.configureTestingModule({
      imports: [PokemonMovesSectionComponent],
      providers: [{ provide: PokemonStore, useValue: pokemonStoreStub }],
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

    component.onMethodPageChange('level-up', { pageIndex: 1 } as any);
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

    component.onMethodPageChange('machine', { pageIndex: 2 } as any);
    fixture.detectChanges();
    expect(component.getPageIndex('machine')).toBe(2);

    selectedEntitySignal.set({
      moves: [createMove('tm-small', 'machine', 0)],
    });
    fixture.detectChanges();

    expect(component.getPageIndex('machine')).toBe(0);
  });
});
