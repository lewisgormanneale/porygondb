import { computed } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import {
  signalState,
  signalStoreFeature,
  withComputed,
  withState,
} from "@ngrx/signals";

const initialState = signalState<{ pageEvent: PageEvent }>({
  pageEvent: { pageSize: 50, pageIndex: 0, length: 0 },
});

export function withPagination() {
  return signalStoreFeature(
    withState<{ pageEvent: PageEvent }>(initialState),
    withComputed(({ pageEvent }) => ({
      offset: computed(() => {
        return pageEvent().pageIndex * pageEvent().pageSize;
      }),
      limit: computed(() => pageEvent().pageSize),
    }))
  );
}
