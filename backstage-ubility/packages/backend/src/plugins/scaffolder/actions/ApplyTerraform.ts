import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import axios from 'axios';
import * as fs from 'fs';
import YAML from 'yaml';
import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import executeShellCommand from '../../../utils/BashExec';

const yaml = require('js-yaml');
const FormData = require('form-data');
const path = require('path');

export const ApplyTerraform = () => {
  return createTemplateAction<{
    cluster_name: string;
  }>({
    id: 'ubility:terraform:apply',
    schema: {
      input: {
        required: ['cluster_name'],
        type: 'object',
        properties: {
          cluster_name: {
            type: 'string',
            title: 'Cluster name',
            description:
              'Name of the aks cluster to be used as a name for the terraform zip file sent to the automation server',
          },
        },
      },
    },
    async handler(ctx) {
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
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const filename = ctx.input.cluster_name
        .trim()
        .replace(' ', '-')
        .toLowerCase();
      ctx.logger.info(filename);
      executeShellCommand(
        `cd ${ctx.workspacePath} && zip -r ${filename}.zip .`,
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      const zip_file_path = path.join(ctx.workspacePath, `${filename}.zip`);
      console.log(zip_file_path);

      ctx.logger.info(zip_file_path);
      const data = new FormData();
      const file = fs.createReadStream(zip_file_path);
      data.append('file', file);
      let response;
      try {
        response = await Axios.post('/platform/terraform/deleteScripts', {
          file_name: filename,
          headers: {
            Authorization: `Bearer ${bearer_token}`,
          },
        });
        // ctx.logger.info(`Delete File Response: ${JSON.stringify(response)}`);
        console.log(`Delete File Response: ${JSON.stringify(response)}`);
      } catch (error) {
        // ctx.logger.info(`Delete File Error:${JSON.stringify(error)}`);
        console.log(`Delete File Error:${JSON.stringify(error)}`);
      }

      let config = {
        method: 'post',
        url: '/platform/terraform/uploadFile',
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${bearer_token}`,
        },
        data: data,
      };
      const res = await Axios(config);
      console.log(res);
      // ctx.logger.info(JSON.stringify(res.data));

      ctx.logger.info(`Uploaded terraform project to automation server`);

      config = {
        method: 'post',
        url: '/platform/terraform/run',
        headers: {
          Authorization: `Bearer ${bearer_token}`,
        },
        data: {
          file_name: filename,
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
      response = await Axios(config);

      console.log(response);

      ctx.logger.info(`Terraform code execution has started`);

      const task_id = response.data.task_id;

      let status = 'STARTED';

      config = {
        method: 'post',
        url: '/platform/terraform/get_terrafrom_result',
        headers: {
          Authorization: `Bearer ${bearer_token}`,
        },
        data: { task_id: task_id },
      };
      while (status === 'STARTED' || status === 'PENDING') {
        response = await Axios(config);
        status = response.data.flow_status;

        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      status = response.data.Status;
      if (status === 'FAIL') throw new Error(JSON.stringify(response.data));
      ctx.logger.info(JSON.stringify(response.data));

      const ip = response.data.load_balancer_ip.value;

      const catalog_info_file_path = `${ctx.workspacePath}/catalog-info.yaml`;
      const catalog_info_json = yaml.load(
        fs.readFileSync(catalog_info_file_path, 'utf-8'),
      );
      catalog_info_json.metadata.annotations['ubilityai.com/ip'] = ip;
      ctx.logger.info(JSON.stringify(catalog_info_json));

      const catalog_info_yaml = new YAML.Document();
      catalog_info_yaml.contents = catalog_info_json;

      fs.writeFileSync(catalog_info_file_path, catalog_info_yaml.toString());
    },
  });
};
