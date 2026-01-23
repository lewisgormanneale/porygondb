import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { withSelectedEntity } from './features/selected-entity.feature';
import { VersionGroups } from './data/version-group.constants';
import { StoredVersionGroup } from '../../core/interfaces/stored-version-group.interface';

export const VersionGroupStore = signalStore(
  { providedIn: 'root' },
  withEntities<StoredVersionGroup>(),
  withSelectedEntity(),
  withMethods((store) => ({
    setSelectedVersionGroupByName(name: string): void {
      const versionGroup = store.entities().find((versionGroup) => versionGroup.name === name);
      if (versionGroup) {
        store.setSelectedId(versionGroup.id);
      }
    },
  })),
  withHooks({
    onInit: (store) => {
      patchState(store, setAllEntities(VersionGroups));
    },
  })
);

export type VersionGroupStore = InstanceType<typeof VersionGroupStore>;
