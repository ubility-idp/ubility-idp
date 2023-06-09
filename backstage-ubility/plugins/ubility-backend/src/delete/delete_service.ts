/* eslint-disable dot-notation */
import { runKubectlCommand } from '../utils/functions';

type PathToEdit = {
  path: string;
  value: string;
};

type Result = {
  deployment_deletion: any;
  service_deletion: any;
  ingress_deletion: any;
};

export const delete_service = async (
  cluster_name: string,
  service_name: string,
  ingress_name: PathToEdit[],
) => {
  const result: Result = {
    deployment_deletion: {},
    service_deletion: {},
    ingress_deletion: {},
  };
  const dep = await runKubectlCommand(
    `kubectl delete deployment ${service_name}`,
    cluster_name,
  );
  const svc = await runKubectlCommand(
    `kubectl delete service ${service_name}`,
    cluster_name,
  );
  const ing = await runKubectlCommand(
    `kubectl delete ingress ${ingress_name}`,
    cluster_name,
  );
  result['deployment_deletion'] = dep.logs;
  result['service_deletion'] = svc.logs;
  result['ingress_deletion'] = ing.logs;

  return result;
};
