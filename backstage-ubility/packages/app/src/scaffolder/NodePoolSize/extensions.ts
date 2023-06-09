import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { NodePoolSize } from './NodePoolSizeExtension';

export const NodePoolSizeExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'NodePoolSize',
    component: NodePoolSize,
  }),
);
