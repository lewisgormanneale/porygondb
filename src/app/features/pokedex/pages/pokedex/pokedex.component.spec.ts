import { PokedexComponent } from "./pokedex.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { PokedexEntriesComponent } from "../../components/pokedex-entries/pokedex-entries.component";
import { MockComponent } from "ng-mocks";
import { VersionGroupSelectComponent } from "../../components/version-group-select/version-group-select.component";

describe("PokédexComponent", () => {
  let fixture: ComponentFixture<PokedexComponent>;
  let component: PokedexComponent;
  const initialState = {
    loading: false,
    pokedex: [
      {
        id: 1,
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
      },
    ],
    totalCount: 100,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexComponent, NoopAnimationsModule, RouterTestingModule],
      declarations: [
        MockComponent(PokedexEntriesComponent),
        MockComponent(VersionGroupSelectComponent),
      ],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("The page should load", async () => {
    expect(component).toBeTruthy();
  });
});
