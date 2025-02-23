import { PageEvent } from '@angular/material/paginator';
import { signalState, signalStoreFeature, withState } from '@ngrx/signals';

const initialState = signalState<{ pageEvent: PageEvent }>({
  pageEvent: { pageSize: 25, pageIndex: 0, length: 0 },
});

export function withPagination() {
  return signalStoreFeature(withState<{ pageEvent: PageEvent }>(initialState));
}
