import {
  Content,
  ContentHeader,
  CopyTextButton,
  InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Grid, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { catalogInfoBase } from '../../../constants';
import ClusterDeleteDialog from '../../Elements/ClusterDeleteDialog';

export const IpAddress = () => {
  const { entity } = useEntity();

  const ip = entity.metadata.annotations?.[`${catalogInfoBase}ip`] || '';

  const cluster_name =
    entity.metadata.annotations?.[`${catalogInfoBase}cluster-name`] ||
    'openopstestcluster';

  return (
    <Content>
      <ContentHeader title="Cluster Info">
        <Grid item>
          <ClusterDeleteDialog
            onCancel={() => {}}
            cluster_name={cluster_name}
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
