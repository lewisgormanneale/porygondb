import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { VersionGroupSelectComponent } from './version-group-select.component';
import { VersionGroupStore } from '../../../../shared/+state/version-group.store';
import type { StoredVersionGroup } from '../../../../core/interfaces/stored-version-group.interface';

describe('VersionGroupSelectComponent', () => {
  let fixture: ComponentFixture<VersionGroupSelectComponent>;
  let component: VersionGroupSelectComponent;

  const paramMapSubject = new BehaviorSubject(convertToParamMap({ versionGroupName: 'red-blue' }));
  const navigateMock = vi.fn().mockResolvedValue(true);

  const versionGroups: StoredVersionGroup[] = [
    {
      id: 1,
      name: 'red-blue',
      formattedName: 'Red/Blue',
      pokedexes: [{ name: 'kanto', formattedName: 'Kanto' }],
    },
    {
      id: 2,
      name: 'gold-silver',
      formattedName: 'Gold/Silver',
      pokedexes: [{ name: 'johto', formattedName: 'Johto' }],
    },
  ];

  const versionGroupStoreStub = {
    entities: () => versionGroups,
    entitiesReversed: () => [...versionGroups].reverse(),
  };

  beforeEach(async () => {
    navigateMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [VersionGroupSelectComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateMock,
          },
        },
        {
          provide: VersionGroupStore,
          useValue: versionGroupStoreStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionGroupSelectComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('syncs selected version group from route params', () => {
    fixture.detectChanges();
    expect(component.selectedVersionGroupName()).toBe('red-blue');

    paramMapSubject.next(convertToParamMap({ versionGroupName: 'gold-silver' }));
    fixture.detectChanges();

    expect(component.selectedVersionGroupName()).toBe('gold-silver');
  });

  it('navigates to default pokedex for selected version group', () => {
    fixture.detectChanges();

    component.navigateToVersionGroupPokedex('gold-silver');

    expect(navigateMock).toHaveBeenCalledWith(['/pokedex', 'gold-silver', 'johto']);
  });

  it('does not navigate when selected version group has no pokedex', () => {
    const entitiesSpy = vi.spyOn(versionGroupStoreStub, 'entities').mockReturnValue([
      {
        id: 3,
        name: 'orphan-group',
        formattedName: 'Orphan Group',
        pokedexes: [],
      },
    ]);

    fixture.detectChanges();
    component.navigateToVersionGroupPokedex('orphan-group');

    expect(navigateMock).not.toHaveBeenCalled();
    entitiesSpy.mockRestore();
  });
});
