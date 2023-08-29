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
      const app_config = await loadBackendConfig({
        argv: process.argv,
        logger: getRootLogger(),
      });
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
