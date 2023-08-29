import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import axios from 'axios';

export const delete_cluster = async (cluster_name: string) => {
  const app_config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const bearer_token = app_config
    .getConfig('ubility')
    .getString('automation-server-jwt');

  const aut_server_base_url = app_config
    .getConfig('ubility')
    .getString('automation-server-base_url');

  const azure_client_id = app_config
    .getConfig('ubility')
    .getString('azure_client_id');

  const azure_tenant_id = app_config
    .getConfig('ubility')
    .getString('azure_tenant_id');

  const azure_client_secret = app_config
    .getConfig('ubility')
    .getString('azure_client_secret');

  const azure_subscription_id = app_config
    .getConfig('ubility')
    .getString('azure_subscription_id');

  const Axios = axios.create({
    baseURL: aut_server_base_url,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const config = {
    method: 'post',
    url: '/platform/terraform/run',
    headers: {
      Authorization: `Bearer ${bearer_token}`,
    },
    data: {
      file_name: cluster_name,
      terraform_variables: {},
      provider: 'azure',
      credentials: {
        CLIENT_ID: azure_client_id,
        SECRET: azure_client_secret,
        SUBSCRIPTION_ID: azure_subscription_id,
        TENANT_ID: azure_tenant_id,
      },
      file_type: 'zipped',
    },
  };
  const response = await Axios(config);
  console.log(response);
  const task_id = response.data.task_id;
  // const result = response;
  return { task_id: task_id };
};
