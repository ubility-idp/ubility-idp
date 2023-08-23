import { editJsonUsingPath, runKubectlCommand } from '../../utils/functions';
import YAML from 'yaml';
import editGithubFile from '../../utils/github';

type PathToEdit = {
  path: string;
  value: string;
};

export const edit_apply_deployment = async (
  cluster_name: string,
  service_name: string,
  pathsToEdit: PathToEdit[],
  githubToken: string,
  githubOwner: string,
  repo: string,
) => {
  const result = await runKubectlCommand(
    `kubectl get deployment ${service_name} -o json`,
    cluster_name,
  );
  const deployment_json = JSON.parse(result.logs || '');

  pathsToEdit.forEach(async path => {
    const pass = await editJsonUsingPath(
      deployment_json,
      path.path,
      path.value,
    );
    if (!pass) throw new Error('Edit Json Failed');
  });

  delete deployment_json.metadata.creationTimestamp;
  delete deployment_json.metadata.uid;
  delete deployment_json.metadata.annotations;
  delete deployment_json.metadata.resourceVersion;
  delete deployment_json.status;

  // return deployment_json;

  const deploymentYaml = new YAML.Document();
  deploymentYaml.contents = deployment_json;

  editGithubFile(
    repo,
    githubOwner,
    'manifests/deployment.yaml',
    deploymentYaml.toString(),
    githubToken,
    'backstage updated deployment.yaml',
  );

  const command = `kubectl apply -f - <<EOF\n${deploymentYaml.toString()}EOF`;

  console.log(deploymentYaml.toString());

  const response = await runKubectlCommand(command, cluster_name);

  return response;
};
