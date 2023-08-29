// import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
// import axios from 'axios';

// const fs = require('fs');
// const path = require('path');

export const ImportRemoteRepo = () => {
  return createTemplateAction<{
    project_name: string;
  }>({
    id: 'ubility:import:repo',
    schema: {
      input: {
        required: ['repo_url'],
        type: 'object',
        properties: {
          repo_url: {
            type: 'string',
            title: 'GitHub repository url',
            description: 'URL of remote repository on GitHub',
          },
        },
      },
    },
    async handler(ctx) {
      console.log(ctx);
    },
  });
};
