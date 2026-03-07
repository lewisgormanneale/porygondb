import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PokemonLocationsSectionComponent } from './pokemon-locations-section.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { GameService } from '../../../../shared/services/game.service';

describe('PokemonLocationsSectionComponent', () => {
  let fixture: ComponentFixture<PokemonLocationsSectionComponent>;
  let component: PokemonLocationsSectionComponent;

  const selectedEntitySignal = signal<any>(null);
  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
  };

  const pokemonServiceStub = {
    getPokemonEncountersByUrl: jest.fn(),
  };

  const gameServiceStub = {
    getVersionGroupByName: jest.fn(),
  };

  beforeEach(async () => {
    pokemonServiceStub.getPokemonEncountersByUrl.mockReset();
    gameServiceStub.getVersionGroupByName.mockReset();

    await TestBed.configureTestingModule({
      imports: [PokemonLocationsSectionComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: GameService, useValue: gameServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonLocationsSectionComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    selectedEntitySignal.set({ location_area_encounters: 'https://encounters' });
    pokemonServiceStub.getPokemonEncountersByUrl.mockReturnValue(of([]));
    gameServiceStub.getVersionGroupByName.mockReturnValue(of({ versions: [] }));

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('filters locations by selected version group versions', () => {
    selectedEntitySignal.set({ location_area_encounters: 'https://encounters' });
    fixture.componentRef.setInput('versionGroupName', 'red-blue');

    pokemonServiceStub.getPokemonEncountersByUrl.mockReturnValue(
      of([
        {
          location_area: { name: 'route-1' },
          version_details: [
            {
              version: { name: 'red' },
              encounter_details: [
                {
                  min_level: 3,
                  max_level: 5,
                  chance: 35,
                  method: { name: 'walk' },
                },
              ],
            },
            {
              version: { name: 'gold' },
              encounter_details: [
                {
                  min_level: 10,
                  max_level: 12,
                  chance: 5,
                  method: { name: 'walk' },
                },
              ],
            },
          ],
        },
      ])
    );

    gameServiceStub.getVersionGroupByName.mockReturnValue(
      of({
        versions: [{ name: 'red' }, { name: 'blue' }],
      })
    );

    fixture.detectChanges();

    const rows = component.locationRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      locationName: 'Route 1',
      methods: 'Walk',
      levelRange: '3-5',
      maxChance: 35,
    });
  });

  it('returns empty rows on request failure', () => {
    selectedEntitySignal.set({ location_area_encounters: 'https://encounters' });
    fixture.componentRef.setInput('versionGroupName', 'red-blue');

    pokemonServiceStub.getPokemonEncountersByUrl.mockReturnValue(
      throwError(() => new Error('boom'))
    );
    gameServiceStub.getVersionGroupByName.mockReturnValue(of({ versions: [] }));

    fixture.detectChanges();

    expect(component.locationRows()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });
});
