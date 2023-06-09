import {
  InfoCard,
  ResponseErrorPanel,
  Progress,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React, { useEffect, useState } from 'react';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { discoveryApiRef } from '@backstage/core-plugin-api';
import { resolveJsonPath } from '../../../utils/functions';
import { InfoElement, Ingress, IngressRes } from '../types';
import InfoItem from '../../Elements/InfoElement';

const PodInfo = ({
  saving,
  setSaving,
  edit,
  reloadAll,
}: {
  saving: boolean;
  setSaving: Function;
  reloadAll: boolean;
  edit: boolean;
}) => {
  const discoveryApi = useApi(discoveryApiRef);
  const { entity } = useEntity();

  const [reload, setReload] = useState(false);
  const [values, setValues] = useState<InfoElement[]>([]);

  const svc_name =
    entity.metadata.annotations?.['backstage.io/kubernetes-id'] || '';

  const github_path =
    entity.metadata.annotations?.['backstage.io/managed-by-location'].split(
      '/',
    );

  const cluster_name =
    entity.metadata.annotations?.['ubilityai.com/cluster-name'] || '';

  if (!github_path) throw new Error('Error retrieving github information');

  const github_owner = github_path[3];
  const github_repo = github_path[4];

  const podInfo = [
    {
      title: 'Replicas',
      paths: ['spec.replicas'],
    },
  ];

  const { fetch } = useApi(fetchApiRef);
  const { loading, error } = useAsync(async (): Promise<IngressRes> => {
    setValues([]);
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/get_deployment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cluster_name: cluster_name,
        service_name: svc_name,
      }),
    });
    const data = await response.json();
    podInfo.forEach((info, i) => {
      const val = resolveJsonPath(
        data?.deployment_json as Ingress,
        info.paths[0],
      );
      setValues((prev: InfoElement[]) => [
        ...prev,
        {
          id: i.toString(),
          title: info.title,
          value: val,
          paths: info.paths,
        },
      ]);
    });
    return data;
  }, [reload, reloadAll]);

  const changeHandler = (event: { target: { value: any } }, id: any) => {
    setValues((prev: InfoElement[]) => {
      const updatedRouteValues = prev.map(routeVal => {
        if (routeVal.id === id) {
          routeVal.value = event.target.value;
        }
        return routeVal;
      });
      return updatedRouteValues;
    });
  };

  const saveHandler = async () => {
    const pathsToEdit = [];

    setSaving(true);

    for (let i = 0; i < values.length; i++) {
      const routeVal = values[i];
      for (let j = 0; j < routeVal.paths.length; j++) {
        const path = routeVal.paths[j];
        pathsToEdit.push({ path: path, value: routeVal.value });
      }
    }

    const baseUrl = await discoveryApi.getBaseUrl('ubility');

    const response = await fetch(`${baseUrl}/edit_apply_deployment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cluster_name: cluster_name,
        service_name: svc_name,
        github_repo: github_repo,
        github_owner: github_owner,
        pathsToEdit: pathsToEdit,
      }),
    });
    await response.json();
    setSaving(false);
    setReload(prev => !prev);
  };

  useEffect(() => {
    if (saving) {
      saveHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard title="Pod">
      {loading ? (
        <Progress />
      ) : (
        values.map((routeVal, i) => {
          return (
            <InfoItem
              key={i}
              id={routeVal.id}
              title={routeVal.title}
              value={routeVal.value}
              onChange={changeHandler}
              edit={edit}
              compact={false}
            />
          );
        })
      )}
    </InfoCard>
  );
};

export default PodInfo;
