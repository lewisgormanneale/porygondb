import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PokedexEntryComponent } from './pokedex-entry.component';
import { PokemonSpecies } from 'pokenode-ts';
import { RouterModule } from '@angular/router';

describe('PokedexEntryComponent', () => {
  let component: PokedexEntryComponent;
  let fixture: ComponentFixture<PokedexEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexEntryComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexEntryComponent);
    component = fixture.componentInstance;
  });

  describe('Given the pokedex entry component is rendered', () => {
    describe('When the component loads while a pokemon still has not passed in as an input', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('pokemon', undefined);
        fixture.detectChanges();
      });

      it('Then the component should be created', () => {
        expect(component).toBeTruthy();
        expect(component.imageLoading()).toEqual(true);
      });

      it('Then a skeleton text element will be displayed as pokemon data is missing', () => {
        const skeleton = fixture.debugElement.query(By.css('.skeleton.skeleton-text'));
        expect(skeleton).toBeTruthy();
      });

      it("Then a spinner is displayed instead of the pokemon's image", fakeAsync(() => {
        const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
        const image = fixture.debugElement.query(By.css('img'));

        expect(spinner).toBeTruthy();
        expect(image).toBeFalsy();
      }));

      it('Then a skeleton button element will be displayed as pokemon data is missing', () => {
        const skeleton = fixture.debugElement.query(By.css('.skeleton.skeleton-button'));
        expect(skeleton).toBeTruthy();
      });

      it('Then no view button is rendered as no pokemon name is known yet', () => {
        const viewButton = fixture.debugElement.query(By.css('a[mat-button]'));
        expect(viewButton).toBeNull();
      });
    });
    describe('When a valid pokemon is passed in as an input', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('pokemon', {
          id: 1,
          name: 'bulbasaur',
          names: [{ language: { name: 'en' }, name: 'Bulbasaur' }],
        } as PokemonSpecies);
        component.onImageLoad();
        fixture.detectChanges();
      });

      it("Then the entry should display the Pokemon's English name", () => {
        const title = fixture.debugElement.query(By.css('mat-card-title'));
        const titleElement = title.nativeElement as HTMLElement;
        expect((titleElement.textContent ?? '').trim()).toBe('Bulbasaur');
      });
      it('Then should display the image and hide progress spinner when it finishes loading', fakeAsync(() => {
        const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
        const image = fixture.debugElement.query(By.css('img'));

        expect(spinner).toBeNull();
        expect(image).toBeTruthy();
      }));
      it("Then a view button should be displayed that routes to that pokemon's page", () => {
        const viewButton = fixture.debugElement.query(By.css('a[mat-button]'));
        expect(viewButton).toBeTruthy();
        expect(viewButton.attributes['href']).toBe('/pokemon/bulbasaur');
      });
    });
  });
});
