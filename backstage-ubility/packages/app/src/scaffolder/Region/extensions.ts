import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { Region } from './RegionExtension';

export const RegionExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'Region',
    component: Region,
  }),
);
