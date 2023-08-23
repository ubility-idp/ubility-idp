import { CatalogClient } from '@backstage/catalog-client';
import {
  createBuiltinActions,
  createRouter,
} from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { ApplyTerraform } from './scaffolder/actions/custom';
import { CreateJenkinsPipeline } from './scaffolder/actions/CreateJenkinsPipeline';
import { ScmIntegrations } from '@backstage/integration';
import { AddRuleToIngress } from './scaffolder/actions/AddRuleToIngress';
import { ExportUbilityConfig } from './scaffolder/actions/ExportConfigVariable';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const actions = [
    ...builtInActions,
    ApplyTerraform(),
    CreateJenkinsPipeline(),
    AddRuleToIngress(),
    ExportUbilityConfig(),
  ];

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
  });
}
