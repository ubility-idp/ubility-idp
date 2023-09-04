import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import executeShellCommand from '../../../utils/BashExec';
import { getRootLogger, loadBackendConfig } from '@backstage/backend-common';
import BashExec from '../../../utils/BashExecute';

export const ImportRemoteRepo = () => {
  return createTemplateAction<{
    repo_owner: string;
    repo_name: string;
  }>({
    id: 'ubility:import:repo',
    schema: {
      input: {
        required: ['repo_owner', 'repo_name'],
        type: 'object',
        properties: {
          repo_owner: {
            type: 'string',
            title: 'Username',
            description: 'Username of GitHub repo owner',
          },
          repo_name: {
            type: 'string',
            title: 'Repo Name',
            description: 'Name of the GitHub repo',
          },
        },
      },
    },
    async handler(ctx) {
      const app_config = await loadBackendConfig({
        argv: process.argv,
        logger: getRootLogger(),
      });

      const github_token = app_config
        .getConfig('integrations')
        .getConfigArray('github')
        .find(config => config.getString('host') == 'github.com')
        ?.getString('token');

      const github_link = `https://${github_token}@github.com/${ctx.input.repo_owner}/${ctx.input.repo_name}`;
      console.log(github_link);

      executeShellCommand(
        `git clone ${github_link} /tmp/${ctx.input.repo_name};ls -la /tmp/${ctx.input.repo_name}`,
      );

      let res = await BashExec(`rm -r /tmp/${ctx.input.repo_name}`);
      console.log('-------------- RM -R --------------');
      console.log(res);
      res = await BashExec(
        `git clone ${github_link} /tmp/${ctx.input.repo_name}`,
      );
      console.log('-------------- GIT CLONE --------------');
      console.log(res);

      res = await BashExec(`ls -la ${ctx.workspacePath}`);
      console.log('-------------- ls -la --------------');
      console.log(res);

      res = await BashExec(
        `cp -a /tmp/${ctx.input.repo_name}/. ${ctx.workspacePath}/`,
      );
      console.log('-------------- cp contents --------------');
      console.log(res);

      res = await BashExec(
        `cd ${ctx.workspacePath};git add .;git commit -m "Added OpenOps files";git push`,
      );
      console.log('-------------- gti push --------------');
      console.log(res);
    },
  });
};
