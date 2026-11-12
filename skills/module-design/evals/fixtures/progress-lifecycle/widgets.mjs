// A route owns this disposer. Navigation can close and reopen the panel
// while a poll from the previous route is still unresolved.
export function mountPanel(store, render) {
  return store.subscribe(value => render({ percent: value.percent }));
}

// The badge may outlive the panel and independently holds a subscription.
export function mountBadge(store, render) {
  return store.subscribe(value => render({ revision: value.revision }));
}
