import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import axios from 'axios';

export const get_cluster_deletion_status = async (task_id: string) => {
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

  const Axios = axios.create({
    baseURL: aut_server_base_url,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const config = {
    method: 'post',
    url: '/platform/terraform/get_terrafrom_result',
    headers: {
      Authorization: `Bearer ${bearer_token}`,
    },
    data: { task_id: task_id },
  };
  const response = await Axios(config);
  return response.data;
};
