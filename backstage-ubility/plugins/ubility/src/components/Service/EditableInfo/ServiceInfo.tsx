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
import { InfoElement, IngressRes, Port } from '../types';
import InfoItem from '../../Elements/InfoElement';
import Ports from '../../Elements/Ports';

const ServiceInfo = ({
  saving,
  setSaving,
  edit,
  setEdit,
  reloadAll,
}: {
  saving: boolean;
  setSaving: Function;
  edit: boolean;
  reloadAll: boolean;
  setEdit: Function;
}) => {
  const discoveryApi = useApi(discoveryApiRef);
  const { entity } = useEntity();

  const [reload, setReload] = useState(false);
  const [values, setValues] = useState<InfoElement[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

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

  const serviceInfo: { title: string; paths: string[] }[] = [];

  const { fetch } = useApi(fetchApiRef);
  const { loading, error } = useAsync(async (): Promise<IngressRes> => {
    setValues([]);
    setPorts([]);
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/get_service`, {
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
    const service_json = data?.service_json;
    serviceInfo.forEach((info, i) => {
      const val = resolveJsonPath(service_json, info.paths[0]);
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
    service_json.spec.ports.map((port: any, i: number) => {
      setPorts(prev => [...prev, { id: i, ...port }]);
    });
    return data;
  }, [reload, reloadAll]);

  const changeHandler = (event: { target: { value: any } }, id: any) => {
    setValues((prev: InfoElement[]) => {
      const updatedServiceValues = prev.map(serviceVal => {
        if (serviceVal.id === id) {
          serviceVal.value = event.target.value;
        }
        return serviceVal;
      });
      return updatedServiceValues;
    });
  };

  const saveHandler = async () => {
    const pathsToEdit = [];

    setSaving(true);

    for (let i = 0; i < values.length; i++) {
      const serviceVal = values[i];
      for (let j = 0; j < serviceVal.paths.length; j++) {
        const path = serviceVal.paths[j];
        pathsToEdit.push({
          path: path,
          value: serviceVal.value,
        });
      }
    }

    pathsToEdit.push({
      path: 'spec.ports',
      value: ports.map(p => {
        return {
          port: p.port,
          name: p.name,
          targetPort: p.targetPort,
          protocol: p.protocol,
        };
      }),
    });

    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/edit_apply_service`, {
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

  const items = [
    <>
      {values.map((serviceVal, i) => {
        return (
          <InfoItem
            key={i}
            id={serviceVal.id}
            title={serviceVal.title}
            value={serviceVal.value}
            onChange={changeHandler}
            edit={edit}
            compact={false}
          />
        );
      })}
    </>,
    <Ports ports={ports} edit={edit} setEdit={setEdit} setPorts={setPorts} />,
  ];

  return <InfoCard title="Service">{loading ? <Progress /> : items}</InfoCard>;
};

export default ServiceInfo;
