import {
  Content,
  ContentHeader,
  CopyTextButton,
  InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Grid, Paper, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { catalogInfoBase } from '../../../constants';
import ClusterDeleteDialog from '../../Elements/ClusterDeleteDialog';

export const IpAddress = () => {
  const { entity } = useEntity();

  const ip = entity.metadata.annotations?.[`${catalogInfoBase}ip`] || '';
  const cluster_name =
    entity.metadata.annotations?.[`${catalogInfoBase}cluster-name`] ||
    'openopstestcluster';
  const [deleting, setDeleting] = useState({
    error: false,
    deleting: false,
    done: false,
    error_message: '',
  });

  const deleteHandler = async () => {
    setDeleting({
      error: false,
      deleting: true,
      done: false,
      error_message: '',
    });
    try {
      const response = await fetch('/api/delete_cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster_name: cluster_name,
        }),
      });
      const result = await response.json();
      const task_id = result.task_id;

      let status = 'STARTED';
      let res_get_delete;

      while (status === 'STARTED' || status === 'PENDING') {
        const res = await fetch('api/delete_cluster_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task_id,
          }),
        });
        res_get_delete = await res.json();
        status = res_get_delete.data.flow_status;

        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      status = res_get_delete.data.Status;
      if (status === 'FAIL')
        setDeleting(prev => {
          return { ...prev, error: true };
        });
      setDeleting({
        error: false,
        deleting: false,
        done: true,
        error_message: '',
      });
    } catch (error) {
      setDeleting({
        error: true,
        deleting: false,
        done: false,
        error_message: `Error: ${error}`,
      });
    }
  };

  return (
    <Content>
      <ContentHeader title="Cluster Info">
        <Grid item>
          <ClusterDeleteDialog
            deleting={deleting.deleting}
            onCancel={() => {}}
            onConfirm={deleteHandler}
          />
        </Grid>
      </ContentHeader>
      <InfoCard title="Networking">
        <Grid alignItems="center" container spacing={1}>
          <Grid item>
            <Box sx={{ width: 140 }}>
              <Typography variant="subtitle1">Load Balancer IP:</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Paper>
              <Box sx={{ py: 0.7, px: 1.5 }}>
                <Typography variant="subtitle2">{ip}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item>
            <CopyTextButton text={ip} aria-label={ip} />
          </Grid>
        </Grid>
      </InfoCard>
    </Content>
  );
};
