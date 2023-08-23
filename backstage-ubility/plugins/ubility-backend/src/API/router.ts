import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { get_ingress } from '../pod/ingress/get_ingress';
import { edit_apply_ingress } from '../pod/ingress/edit_ingress';
import { get_deployment } from '../pod/deployment/get_deployment';
import { edit_apply_deployment } from '../pod/deployment/edit_deployment';
import { edit_apply_service } from '../pod/service/edit_service';
import { get_service } from '../pod/service/get_service';
import { delete_service } from '../pod/delete/delete_service';
import { delete_cluster } from '../cluster/delete_cluster';
import editGithubFile from '../utils/github';
import axios from 'axios';

interface AzSize {
  maxDataDiskCount: number;
  memoryInMb: number;
  name: string;
  numberOfCores: number;
  osDiskSizeInMb: number;
  resourceDiskSizeInMb: number;
}

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const automation_server_base_url = config
    .getConfig('ubility')
    .getString('automation-server-base_url');

  const token = config
    .getConfig('integrations')
    .getConfigArray('github')[0]
    .getString('token');

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // router.get('/config_test', (_, response) => {
  //   const token =
  //     config.getConfig('integrations').parent.config.data.integrations.github[0]
  //       .token;
  //   response.send({ token: token });
  // });

  router.post('/get_ingress', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const ingress_json = await get_ingress(cluster_name, service_name);
    response.send({ ingress_json: ingress_json ? ingress_json : {} });
  });

  router.post('/edit_apply_ingress', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const pathsToEdit = request.body?.pathsToEdit;
    const github_repo = request.body?.github_repo;
    const github_owner = request.body?.github_owner;
    const ingress_json = await edit_apply_ingress(
      cluster_name,
      service_name,
      pathsToEdit,
      token,
      github_owner,
      github_repo,
    );
    response.send({ message: ingress_json ? ingress_json : {} });
  });

  router.post('/get_deployment', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const deployment_json = await get_deployment(cluster_name, service_name);
    response.send({ deployment_json: deployment_json ? deployment_json : {} });
  });

  router.post('/edit_apply_deployment', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const pathsToEdit = request.body?.pathsToEdit;
    const github_repo = request.body?.github_repo;
    const github_owner = request.body?.github_owner;
    const deployment_json = await edit_apply_deployment(
      cluster_name,
      service_name,
      pathsToEdit,
      token,
      github_owner,
      github_repo,
    );
    response.send({ message: deployment_json ? deployment_json : {} });
  });

  router.post('/get_service', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const service_json = await get_service(cluster_name, service_name);
    response.send({ service_json: service_json ? service_json : {} });
  });

  router.post('/edit_apply_service', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const pathsToEdit = request.body?.pathsToEdit;
    const github_repo = request.body?.github_repo;
    const github_owner = request.body?.github_owner;
    const service_json = await edit_apply_service(
      cluster_name,
      service_name,
      pathsToEdit,
      token,
      github_owner,
      github_repo,
    );
    response.send({ message: service_json ? service_json : {} });
  });

  router.post('/delete_service', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const service_name = request.body?.service_name;
    const ingress_name = request.body?.ingress_name;
    const delete_res = await delete_service(
      cluster_name,
      service_name,
      ingress_name,
    );
    response.send({ delete_res: delete_res ? delete_res : {} });
  });

  router.post('/edit_catalog_info', async (request, response) => {
    const github_repo = request.body?.github_repo;
    const github_owner = request.body?.github_owner;
    const file_content = request.body?.file_content;
    const success = editGithubFile(
      github_repo,
      github_owner,
      'catalog-info.yaml',
      file_content,
      token,
      'backstage updated catalog-info',
    );
    response.send({ message: success });
  });

  router.post('/delete_cluster', async (request, response) => {
    const cluster_name = request.body?.cluster_name;
    const delete_res = await delete_cluster(cluster_name);
    response.send({ delete_res: delete_res ? delete_res : {} });
  });

  router.get('/get_azure_regions', async (_, response) => {
    let regs = [];
    console.log('hello');

    try {
      const res = await axios.get(
        `${automation_server_base_url}/backstage/regions`,
      );
      regs = res.data.regions.map((reg: { Region: any }) => {
        return reg.Region;
      });
      regs = regs.sort();
    } catch (error) {
      console.log(error);
      response.send({ regions: [] });
    }
    response.send({ regions: regs });
  });

  router.post('/get_node_pool_sizes', async (request, response) => {
    let node_pool_sizes = [];
    const region = request.body?.region;
    try {
      const res = await axios.get(
        `${automation_server_base_url}/backstage/${region}/nodesizes`,
      );
      node_pool_sizes = res.data.sizes.map((size: AzSize) => {
        return {
          name: `${size.name} - Cores:${size.numberOfCores} Ram:${size.memoryInMb}`,
          value: size.name,
        };
      });
      node_pool_sizes = node_pool_sizes.sort();
    } catch (error) {
      console.log(error);
      response.send({ sizes: [] });
    }
    response.send({ sizes: node_pool_sizes });
  });

  router.use(errorHandler());
  return router;
}
