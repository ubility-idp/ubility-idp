import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { ubilityPlugin, UbilityPage } from '../src/plugin';

createDevApp()
  .registerPlugin(ubilityPlugin)
  .addPage({
    element: <UbilityPage />,
    title: 'Root Page',
    path: '/ubility'
  })
  .render();
