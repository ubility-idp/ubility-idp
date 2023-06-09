import { editJsonUsingPath, runKubectlCommand } from '../utils/functions';
import YAML from 'yaml';
import editGithubFile from '../utils/github';

type PathToEdit = {
  path: string;
  value: string;
};

export const edit_apply_ingress = async (
  cluster_name: string,
  service_name: string,
  pathsToEdit: PathToEdit[],
  githubToken: string,
  githubOwner: string,
  repo: string,
) => {
  const result = await runKubectlCommand(
    'kubectl get ingress -o json',
    cluster_name,
  );
  const res = JSON.parse(result.logs || '');
  const ingress_json = res.items.find(
    (ingress: { metadata: { name: string } }) => {
      return service_name === ingress.metadata.name.split('ingress-')[1];
    },
  );

  pathsToEdit.forEach(async path => {
    const pass = editJsonUsingPath(ingress_json, path.path, path.value);
    if (!pass) return;
  });

  const ingressYaml = new YAML.Document();
  ingressYaml.contents = ingress_json;

  delete ingress_json.metadata.creationTimestamp;
  delete ingress_json.metadata.uid;
  delete ingress_json.metadata.annotations[
    'kubectl.kubernetes.io/last-applied-configuration'
  ];
  delete ingress_json.metadata.resourceVersion;

  editGithubFile(
    repo,
    githubOwner,
    'manifests/ingress.yaml',
    ingressYaml.toString(),
    githubToken,
    'backstage updated ingress.yaml',
  );

  const command = `kubectl apply -f - <<EOF\n${ingressYaml.toString()}EOF`;

  const response = await runKubectlCommand(command, cluster_name);

  return response;
};
