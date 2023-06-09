import { ContainerServiceClient } from '@azure/arm-containerservice';
import { DefaultAzureCredential } from '@azure/identity';
import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import YAML from 'yaml';

const ingressAllJson = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: '',
    annotations: {
      'kubernetes.io/ingress.class': 'nginx',
      'cert-manager.io/cluster-issuer': 'letsencrypt',
    },
  },
  spec: {
    rules: [
      {
        host: '',
        http: {
          paths: [
            {
              backend: {
                service: {
                  name: '',
                  port: {
                    number: 80,
                  },
                },
              },
              path: '',
              pathType: 'Prefix',
            },
          ],
        },
      },
    ],
    tls: [
      {
        hosts: [''],
        secretName: '',
      },
    ],
  },
};

async function runKubectlCommand(command: string, cluster_name: string) {
  const app_config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const resourceGroupName = app_config
    .getConfig('ubility')
    .getString('resource_group');
  const subscriptionId = app_config
    .getConfig('ubility')
    .getString('subscription_id');

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
  console.log('RESULT!!!!!!!!!!!!!!!!!!!111');
  console.log(result);
  return result;
}

export const AddRuleToIngress = () => {
  return createTemplateAction<{
    domain: string;
    path: string;
    serviceName: string;
    cluster_name: string;
  }>({
    id: 'ubility:add:addingressrule',
    schema: {
      input: {
        required: ['domain', 'path', 'serviceName'],
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            title: 'Domain name',
            description: 'Domain name of the cluster',
          },
          path: {
            type: 'string',
            title: 'Url path',
            description: 'Url path of the service',
          },
          serviceName: {
            type: 'string',
            title: 'Service name',
            description: 'Service name of the app',
          },
          cluster_name: {
            type: 'string',
            title: 'Cluster name',
            description:
              'Name of the cluster on which the ingress will be created',
          },
        },
      },
    },
    async handler(ctx) {
      const result = await runKubectlCommand(
        'kubectl get ingress -o json',
        ctx.input.cluster_name,
      );
      let ingressJson = JSON.parse(result.logs || '');

      const serviceName = ctx.input.serviceName
        .toLowerCase()
        .replace(/ /g, '-');

      const toAdd = {
        host: ctx.input.domain,
        http: {
          paths: [
            {
              backend: {
                service: {
                  name: serviceName,
                  port: {
                    number: 80,
                  },
                },
              },
              path: ctx.input.path,
              pathType: 'Prefix',
            },
          ],
        },
      };

      const tlsToAdd = {
        hosts: [ctx.input.domain],
        secretName: `${serviceName}-secret`,
      };

      ingressAllJson.spec.rules = [toAdd];
      ingressAllJson.spec.tls = [tlsToAdd];
      ingressAllJson.metadata.name = `ingress-${serviceName}`;
      ingressJson = ingressAllJson;

      const ingressYaml = new YAML.Document();
      ingressYaml.contents = ingressJson;

      const command = `kubectl apply -f - <<EOF\n${ingressYaml.toString()}EOF`;

      console.log(command);
      // ctx.logger.info(command);

      const res = await runKubectlCommand(command, ctx.input.cluster_name);

      ctx.logger.info(JSON.stringify(res));
    },
  });
};
