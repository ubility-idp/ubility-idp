import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import axios from 'axios';

const fs = require('fs');
const path = require('path');

export const ImportRemoteRepo = () => {
  return createTemplateAction<{
    project_name: string;
  }>({
    id: 'ubility:import:repo',
    schema: {
      input: {
        required: ['project_name'],
        type: 'object',
        properties: {
          project_name: {
            type: 'string',
            title: 'Project Name',
            description: 'This will be used as the pipeline name on jenkins',
          },
        },
      },
    },
    async handler(ctx) {
      const app_config = await loadBackendConfig({
        argv: process.argv,
        logger: getRootLogger(),
      });
      const JENKINS_ADDRESS = app_config
        .getConfig('ubility')
        .getString('jenkins-address');
      const PIPELINE_NAME = ctx.input.project_name;
      const API_TOKEN = app_config.getConfig('jenkins').getString('apiKey');
      const USERNAME = app_config.getConfig('jenkins').getString('username');

      const configPath = path.join(ctx.workspacePath, 'config.xml');

      let url = `http://${JENKINS_ADDRESS}/createItem?name=${PIPELINE_NAME}`;
      const config = fs.readFileSync(configPath);

      const options = {
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'text/xml',
        },
        auth: {
          username: USERNAME,
          password: API_TOKEN,
        },
        data: config,
      };

      let response = await axios(options);
      ctx.logger.info(`Job ${PIPELINE_NAME} has been created on jenkins`);

      url = `http://${JENKINS_ADDRESS}/job/${PIPELINE_NAME}/buildWithParameters`;

      let opt = {
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'text/xml',
        },
        auth: {
          username: USERNAME,
          password: API_TOKEN,
        },
      };

      response = await axios(opt);
      ctx.logger.info(`Building ${PIPELINE_NAME} job on jenkins`);

      await new Promise(resolve => setTimeout(resolve, 10000));

      url = `http://${JENKINS_ADDRESS}/job/${PIPELINE_NAME}/1/api/json`;

      opt = {
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'text/xml',
        },
        auth: {
          username: USERNAME,
          password: API_TOKEN,
        },
      };

      response = await axios(opt);
      console.log(response);
      ctx.logger.info(
        `You can see the job status using this link: ${response.data.url}`,
      );
    },
  });
};
