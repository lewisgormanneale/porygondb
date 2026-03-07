import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PokemonStatsSectionComponent } from './pokemon-stats-section.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('PokemonStatsSectionComponent', () => {
  let fixture: ComponentFixture<PokemonStatsSectionComponent>;
  let component: PokemonStatsSectionComponent;

  const selectedPokemonStatsSignal = signal<Record<string, number>>({
    hp: 80,
    attack: 100,
    defense: 70,
    'special-attack': 90,
    'special-defense': 60,
    speed: 110,
  });

  const pokemonStoreStub = {
    selectedPokemonStats: selectedPokemonStatsSignal,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonStatsSectionComponent],
      providers: [{ provide: PokemonStore, useValue: pokemonStoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonStatsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('computes stat rows and total', () => {
    const rows = component.statRows();
    expect(rows).toHaveLength(6);
    expect(rows[1]).toEqual({ key: 'attack', label: 'Attack', value: 100 });
    expect(component.baseStatTotal()).toBe(510);
  });

  it('builds radar primitives for all six axes', () => {
    expect(component.gridPolygons()).toHaveLength(5);
    expect(component.axisLines()).toHaveLength(6);
    expect(component.axisLabelPoints()).toHaveLength(6);
    expect(component.radarPoints().split(' ').length).toBe(6);
  });
});
