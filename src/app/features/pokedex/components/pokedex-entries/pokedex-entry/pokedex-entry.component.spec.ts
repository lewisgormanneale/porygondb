import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { PokedexEntryComponent } from "./pokedex-entry.component";
import { PokemonSpecies } from "pokenode-ts";
import { RouterModule } from "@angular/router";

describe("PokedexEntryComponent", () => {
  let component: PokedexEntryComponent;
  let fixture: ComponentFixture<PokedexEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexEntryComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexEntryComponent);
    component = fixture.componentInstance;
  });

  describe("Given the pokedex entry component is rendered", () => {
    describe("When the component loads while a pokemon still has not passed in as an input", () => {
      beforeEach(() => {
        fixture.componentRef.setInput("pokemon", undefined);
        fixture.detectChanges();
      });
      it("Then the component should be created", () => {
        expect(component).toBeTruthy();
        expect(component.imageLoading()).toEqual(true);
      });

      it("Then skeleton text elements will be displayed as pokemon data is missing", () => {
        const skeleton = fixture.debugElement.query(
          By.css(".skeleton.skeleton-text")
        );
        expect(skeleton).toBeTruthy(); // Skeleton rendered
      });

      it("Then a spinner is displayed instead of the pokemon's image", fakeAsync(() => {
        let spinner = fixture.debugElement.query(
          By.css("mat-progress-spinner")
        );
        let image = fixture.debugElement.query(By.css("img"));

        expect(spinner).toBeTruthy();
        expect(image).toBeFalsy();
      }));
    });
    describe("When a valid pokemon is passed in as an input", () => {
      beforeEach(() => {
        fixture.componentRef.setInput("pokemon", {
          id: 1,
          name: "bulbasaur",
          names: [{ language: { name: "en" }, name: "Bulbasaur" }],
        } as PokemonSpecies);
        component.onImageLoad();
        fixture.detectChanges();
      });

      it("Then the entry should display the Pokemon's English name", () => {
        const title = fixture.debugElement.query(By.css("mat-card-title"));
        expect(title.nativeElement.textContent.trim()).toBe("Bulbasaur");
      });
      it("Then should display the image and hide progress spinner when it finishes loading", fakeAsync(() => {
        const spinner = fixture.debugElement.query(
          By.css("mat-progress-spinner")
        );
        const image = fixture.debugElement.query(By.css("img"));

        expect(spinner).toBeNull();
        expect(image).toBeTruthy();
      }));
      it("Then a view button should be displayed that routes to that pokemon's page", () => {
        const viewButton = fixture.debugElement.query(By.css("a[mat-button]"));
        expect(viewButton).toBeTruthy();
        expect(viewButton.attributes["href"]).toBe("/pokemon/bulbasaur");
      });
    });
  });

  it('should not display the "View" button for a missing name', () => {
    fixture.componentRef.setInput("pokemon", {
      id: 1,
    } as PokemonSpecies);
    fixture.detectChanges();

    const viewButton = fixture.debugElement.query(By.css("a[mat-button]"));
    expect(viewButton).toBeNull(); // Button should not render
  });
});
