import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'ubility',
});

export const ubilityPlugin = createPlugin({
  id: 'ubility',
  routes: {
    root: rootRouteRef,
  },
});

export const UbilityPage = ubilityPlugin.provide(
  createRoutableExtension({
    name: 'UbilityPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);

export const EntityUbilityCard = ubilityPlugin.provide(
  createComponentExtension({
    name: 'EntityUbilityCard',
    component: {
      lazy: () =>
        import('./components/EntityOverviewCard').then(
          m => m.EntityOverviewCard,
        ),
    },
  }),
);

export const EntityUbilityClusterContent = ubilityPlugin.provide(
  createRoutableExtension({
    name: 'EntityUbilityContent',
    component: () =>
      import('./components/Cluster/Cluster').then(m => m.Cluster),
    mountPoint: rootRouteRef,
  }),
);

export const EntityUbilityServiceContent = ubilityPlugin.provide(
  createRoutableExtension({
    name: 'EntityUbilityContent',
    component: () =>
      import('./components/Service/EditableInfo').then(m => m.Service),
    mountPoint: rootRouteRef,
  }),
);
