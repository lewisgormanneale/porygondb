import { computed } from "@angular/core";
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { EntityId, EntityState } from "@ngrx/signals/entities";

export type SelectedEntityState = { selectedEntityId: EntityId | null };

export function withSelectedEntity<Entity>() {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withMethods((store) => ({
      setSelectedId(selectedEntityId: EntityId | null) {
        patchState(store, (state) => ({ ...state, selectedEntityId }));
      },
    })),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    }))
  );
}
