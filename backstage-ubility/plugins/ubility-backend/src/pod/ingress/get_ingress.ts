import { runKubectlCommand } from '../../utils/functions';

export const get_ingress = async (
  cluster_name: string,
  service_name: string,
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
  return ingress_json;
};
