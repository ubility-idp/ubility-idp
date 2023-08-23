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

export const delete_cluster = async (cluster_name: string) => {
  const result: Result = {
    deployment_deletion: {},
    service_deletion: {},
    ingress_deletion: {},
  };
  return result;
};
