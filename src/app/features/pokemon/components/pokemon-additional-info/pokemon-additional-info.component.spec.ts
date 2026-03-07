import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PokemonAdditionalInfoComponent } from './pokemon-additional-info.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('PokemonAdditionalInfoComponent', () => {
  let fixture: ComponentFixture<PokemonAdditionalInfoComponent>;
  let component: PokemonAdditionalInfoComponent;

  const selectedEntitySignal = signal<any>({
    base_experience: 64,
  });

  const speciesDetailsSignal = signal<any>({
    capture_rate: 45,
    hatch_counter: 20,
    shape: { name: 'quadruped' },
    egg_groups: [{ name: 'monster' }, { name: 'dragon' }],
  });

  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
    speciesDetails: speciesDetailsSignal,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonAdditionalInfoComponent],
      providers: [{ provide: PokemonStore, useValue: pokemonStoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonAdditionalInfoComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('maps known shapes to material icons', () => {
    expect(component.getShapeIcon('quadruped')).toBe('pets');
  });

  it('returns default icon for unknown shapes', () => {
    expect(component.getShapeIcon('unknown-shape')).toBe('help');
  });

  it('renders key additional information values', () => {
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Base Experience');
    expect(content).toContain('64 XP');
    expect(content).toContain('Capture Rate');
    expect(content).toContain('Egg Groups');
    expect(content).toContain('Monster');
    expect(content).toContain('Dragon');
  });
});
