import { runKubectlCommand } from '../../utils/functions';

export const get_service = async (
  cluster_name: string,
  service_name: string,
) => {
  const result = await runKubectlCommand(
    `kubectl get service ${service_name} -o json`,
    cluster_name,
  );
  const service_json = JSON.parse(result.logs || '');
  return service_json;
};
