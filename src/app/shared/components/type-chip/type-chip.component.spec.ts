import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TypeChipComponent } from "./type-chip.component";
import { ComponentRef } from "@angular/core";

describe("PokemonTypeChipsComponent", () => {
  let component: TypeChipComponent;
  let componentRef: ComponentRef<TypeChipComponent>;
  let fixture: ComponentFixture<TypeChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TypeChipComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput("typeName", "fire");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
