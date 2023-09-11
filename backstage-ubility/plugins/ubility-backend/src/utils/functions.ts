import { ConfigReader } from '@backstage/config';
import { Logger } from 'winston';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { DefaultAzureCredential } from '@azure/identity';
import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';

export interface RouterOptions {
  logger: Logger;
  config: ConfigReader;
}

export const runKubectlCommand = async (
  command: string,
  cluster_name: string,
) => {
  const app_config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const resourceGroupName = app_config
    .getConfig('ubility')
    .getString('resource_group');
  const subscriptionId = app_config
    .getConfig('ubility')
    .getString('azure_subscription_id');
  const resourceName = cluster_name;
  const requestPayload = {
    clusterToken: '',
    command: command,
    context: '',
  };
  const credential = new DefaultAzureCredential();
  const client = new ContainerServiceClient(credential, subscriptionId);
  const result = await client.managedClusters.beginRunCommandAndWait(
    resourceGroupName,
    resourceName,
    requestPayload,
  );
  return result;
};

export function resolveJsonPath(obj: any, path: string): any {
  try {
    const pathSegments = path.split('.');
    return pathSegments.reduce((acc: any, key: string) => {
      return acc[key];
    }, obj);
  } catch (error) {
    return undefined;
  }
}

export function editJsonUsingPath(
  obj: any,
  path: string,
  value: any,
  add: boolean = false,
): boolean {
  try {
    const pathSegments = path.split('.');
    pathSegments.reduce((acc: any, key: string, i, _) => {
      if (i === pathSegments.length - 1) {
        if (add) {
          acc[key].push(value);
        } else {
          console.log({ value, isNan: isNaN(parseInt(value, 10)) });

          if (isNaN(parseInt(value, 10))) acc[key] = value;
          else acc[key] = parseInt(value, 10);
        }
      }

      return acc[key];
    }, obj);
    return true;
  } catch (error) {
    return false;
  }
}
