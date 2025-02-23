import { PokedexComponent } from './pokedex.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';

describe('PokédexComponent', () => {
  let fixture: ComponentFixture<PokedexComponent>;
  let loader: HarnessLoader;
  let component: PokedexComponent;
  const initialState = {
    loading: false,
    pokedex: [
      {
        id: 1,
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      },
    ],
    totalCount: 100,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PokedexComponent,
        MatPaginatorModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
  });

  it('The page should load', async () => {
    expect(component).toBeTruthy();
  });
});
