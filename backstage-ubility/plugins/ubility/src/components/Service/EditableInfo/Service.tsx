import { Content, ContentHeader, Progress } from '@backstage/core-components';
import React, { useState } from 'react';
import EditControls from '../../Elements/EditControls';
import { Grid, Typography } from '@material-ui/core';
import IngressInfo from './IngressInfo';
import PodInfo from './DeploymentInfo';
import ServiceInfo from './ServiceInfo';
import { useEntity } from '@backstage/plugin-catalog-react';
import DeleteDialog from '../../Elements/DeleteDialog';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import YAML from 'yaml';

export const Service = () => {
  const [edit, setEdit] = useState(false);
  const editClicked = (val: boolean) => {
    setEdit(val);
  };

  const { entity } = useEntity();

  const ubility_svc = entity.metadata.annotations?.['ubilityai.com/svc'] || '';
  const ubility_deleted =
    entity.metadata.annotations?.['ubilityai.com/deleted'] || '';

  const discoveryApi = useApi(discoveryApiRef);

  const [deleting, setDeleting] = useState(false);

  const [ingressSaving, setIngressSaving] = useState(false);
  const [podSaving, setPodSaving] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [reloadAll, setReloadAll] = useState(false);

  const github_path =
    entity.metadata.annotations?.['backstage.io/managed-by-location'].split(
      '/',
    );

  const cluster_name =
    entity.metadata.annotations?.['ubilityai.com/cluster-name'] || '';

  if (!github_path) throw new Error('Error retrieving github information');

  const github_owner = github_path[3];
  const github_repo = github_path[4];

  const saveHandler = () => {
    // add logic to only save changed modules
    setIngressSaving(true);
    setPodSaving(true);
    setServiceSaving(true);
  };

  const deleteHandler = async () => {
    setDeleting(true);
    const baseUrl = await discoveryApi.getBaseUrl('ubility');

    const svc_name =
      entity.metadata.annotations?.['backstage.io/kubernetes-id'] || '';
    const response_ing = await fetch(`${baseUrl}/delete_service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cluster_name: cluster_name,
        service_name: svc_name,
        ingress_name: `ingress-${svc_name}`,
      }),
    });
    await response_ing.json();

    if (entity.metadata.annotations !== undefined) {
      entity.metadata.annotations['ubilityai.com/deleted'] = 'yes';
      const entity_json = entity as any;

      delete entity_json['relations'];
      delete entity_json['status'];

      const catalogYaml = new YAML.Document();
      catalogYaml.contents = entity_json as any;

      const response = await fetch(`${baseUrl}/edit_catalog_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_repo: github_repo,
          github_owner: github_owner,
          file_content: catalogYaml.toString(),
        }),
      });
      await response.json();
      setDeleting(false);
    }
  };

  if (deleting) {
    return (
      <>
        <ContentHeader title="Deleting..." />
        <Progress />
      </>
    );
  }

  if (ubility_deleted === 'yes') {
    return (
      <Content>
        <ContentHeader title="Service deleted from cluster" />
        <Typography>
          Launch a jenkins build in the CI/CD tab to redeploy
        </Typography>
      </Content>
    );
  }

  return (
    <>
      {(ingressSaving || serviceSaving || podSaving) && <Progress />}
      <Content>
        <ContentHeader title="Service Info">
          <Grid container spacing={3}>
            <Grid item>
              <DeleteDialog onCancel={() => {}} onConfirm={deleteHandler} />
            </Grid>
            <Grid item>
              <EditControls
                edit={edit}
                setEdit={setEdit}
                onEdit={editClicked}
                onSave={saveHandler}
                saving={ingressSaving || serviceSaving || podSaving}
                setReloadAll={setReloadAll}
              />
            </Grid>
          </Grid>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          {ubility_svc === 'public' && (
            <Grid item>
              <IngressInfo
                edit={edit}
                saving={ingressSaving}
                setSaving={setIngressSaving}
                reloadAll={reloadAll}
              />
            </Grid>
          )}
          <Grid item>
            <PodInfo
              edit={edit}
              saving={podSaving}
              setSaving={setPodSaving}
              reloadAll={reloadAll}
            />
          </Grid>
          <Grid item>
            <ServiceInfo
              edit={edit}
              setEdit={setEdit}
              saving={serviceSaving}
              setSaving={setServiceSaving}
              reloadAll={reloadAll}
            />
          </Grid>
        </Grid>
      </Content>
    </>
  );
};
