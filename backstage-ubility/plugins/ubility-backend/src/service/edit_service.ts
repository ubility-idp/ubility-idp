import { editJsonUsingPath, runKubectlCommand } from '../utils/functions';
import YAML from 'yaml';
import editGithubFile from '../utils/github';

type PathToEdit = {
  path: string;
  value: string;
  add: boolean;
};

export const edit_apply_service = async (
  cluster_name: string,
  service_name: string,
  pathsToEdit: PathToEdit[],
  githubToken: string,
  githubOwner: string,
  repo: string,
) => {
  const result = await runKubectlCommand(
    `kubectl get service ${service_name} -o json`,
    cluster_name,
  );
  const service_json = JSON.parse(result.logs || '');

  pathsToEdit.forEach(async path => {
    const pass = editJsonUsingPath(
      service_json,
      path.path,
      path.value,
      path.add,
    );
    if (!pass) throw new Error('Edit Json Failed');
  });

  delete service_json.metadata.creationTimestamp;
  delete service_json.metadata.uid;
  delete service_json.metadata.annotations;
  delete service_json.metadata.resourceVersion;

  // return service_json;

  const deploymentYaml = new YAML.Document();
  deploymentYaml.contents = service_json;

  editGithubFile(
    repo,
    githubOwner,
    'manifests/service.yaml',
    deploymentYaml.toString(),
    githubToken,
    'backstage updated service.yaml',
  );

  const command = `kubectl apply -f - <<EOF\n${deploymentYaml.toString()}EOF`;

  // console.log(deploymentYaml.toString());

  const response = await runKubectlCommand(command, cluster_name);

  return response;
};
