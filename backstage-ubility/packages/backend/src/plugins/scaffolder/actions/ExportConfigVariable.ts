import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const ExportUbilityConfig = () => {
  return createTemplateAction<{}>({
    id: 'ubility:output:exportconfig',
    schema: {
      output: {
        type: 'object',
        properties: {
          container_registry: {
            type: 'string',
            title: 'Container Registry',
            description: 'Container Registry found in ubility configuration',
          },
          resource_group: {
            type: 'string',
            title: 'Resource Group',
            description: 'Resource Group found in ubility configuration',
          },
          azure_tenant_id: {
            type: 'string',
            title: 'Azure Tenant ID',
            description: 'Azure Tenant ID found in ubility configuration',
          },
        },
      },
    },
    async handler(ctx) {
      const app_config = await loadBackendConfig({
        argv: process.argv,
        logger: getRootLogger(),
      });

      const container_registry = app_config
        .getConfig('ubility')
        .getString('container_registry');
      const resource_group = app_config
        .getConfig('ubility')
        .getString('resource_group');
      const azure_tenant_id = app_config
        .getConfig('ubility')
        .getString('azure_tenant_id');

      ctx.output('container_registry', container_registry);
      ctx.output('resource_group', resource_group);
      ctx.output('azure_tenant_id', azure_tenant_id);
    },
  });
};
