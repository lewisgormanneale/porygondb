import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PokedexEntriesComponent } from './pokedex-entries.component';
import { GameService } from '../../../../shared/services/game.service';
import { PokedexEntriesStore } from '../../+state/pokedex-entries.store';

describe('PokedexEntriesComponent', () => {
  let fixture: ComponentFixture<PokedexEntriesComponent>;
  let component: PokedexEntriesComponent;

  const paginatedEntriesSignal = signal<any[]>([]);
  const entitiesSignal = signal<any[]>([]);
  const pageEventSignal = signal({ pageIndex: 0, pageSize: 50, length: 0 });

  const setPokedexEntriesMock = jest.fn();
  const loadPokemonSpeciesMock = jest.fn();

  const pokedexEntriesStoreStub = {
    paginatedPokemonEntries: paginatedEntriesSignal,
    entities: entitiesSignal,
    pageEvent: pageEventSignal,
    setPokedexEntries: setPokedexEntriesMock,
    loadPokemonSpecies: loadPokemonSpeciesMock,
  };

  const getPokedexByNameMock = jest.fn();
  const gameServiceStub = {
    getPokedexByName: getPokedexByNameMock,
  };

  const breakpointState$ = new BehaviorSubject<any>({ matches: false });
  const breakpointObserverStub = {
    observe: jest.fn(() => breakpointState$.asObservable()),
  };

  beforeEach(async () => {
    setPokedexEntriesMock.mockClear();
    loadPokemonSpeciesMock.mockClear();
    getPokedexByNameMock.mockReset();

    paginatedEntriesSignal.set([]);
    entitiesSignal.set([]);
    pageEventSignal.set({ pageIndex: 0, pageSize: 50, length: 0 });
    breakpointState$.next({ matches: false });

    getPokedexByNameMock.mockReturnValue(
      of({
        pokemon_entries: [{ pokemon_species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } }],
      })
    );

    await TestBed.configureTestingModule({
      imports: [PokedexEntriesComponent],
    })
      .overrideComponent(PokedexEntriesComponent, {
        set: {
          providers: [
            { provide: GameService, useValue: gameServiceStub },
            { provide: PokedexEntriesStore, useValue: pokedexEntriesStoreStub },
            { provide: BreakpointObserver, useValue: breakpointObserverStub },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PokedexEntriesComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('loads pokedex entries when both inputs are present', () => {
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(getPokedexByNameMock).toHaveBeenCalledWith('kanto');
    expect(setPokedexEntriesMock).toHaveBeenCalledWith([
      { pokemon_species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
    ]);
    expect(loadPokemonSpeciesMock).toHaveBeenCalled();
  });

  it('does not load pokedex entries when one input is missing', () => {
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('versionGroupName', '');
    fixture.detectChanges();

    expect(getPokedexByNameMock).not.toHaveBeenCalled();
  });

  it('toggles hidePageSize based on handset breakpoint', () => {
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    expect(component.hidePageSize()).toBe(false);

    breakpointState$.next({ matches: true });
    fixture.detectChanges();

    expect(component.hidePageSize()).toBe(true);
  });

  it('shows loading bar when no paginated entries exist', () => {
    paginatedEntriesSignal.set([]);

    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    const paginator = fixture.nativeElement.querySelector('mat-paginator');

    expect(progressBar).toBeTruthy();
    expect(paginator).toBeNull();
  });
});
