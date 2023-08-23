import { runKubectlCommand } from '../../utils/functions';

export const get_deployment = async (
  cluster_name: string,
  service_name: string,
) => {
  const result = await runKubectlCommand(
    `kubectl get deployment ${service_name} -o json`,
    cluster_name,
  );
  const deployment_json = JSON.parse(result.logs || '');
  return deployment_json;
};
