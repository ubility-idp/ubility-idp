import React from 'react';
import EditInput from './Input';
import { Box, Grid, Typography } from '@material-ui/core';

type Props = {
  title: string;
  value: string;
  id: string;
  edit: boolean;
  onChange: Function;
  compact: boolean;
};

function InfoItem({ title, value, edit, onChange, id, compact }: Props) {
  return (
    <Grid alignItems="center" container spacing={2}>
      <Grid item>
        {compact ? (
          <Box sx={{ width: 100 }}>
            <Typography variant="subtitle1">{title}:</Typography>
          </Box>
        ) : (
          <Box sx={{ width: 150 }}>
            <Typography variant="subtitle1">{title}:</Typography>
          </Box>
        )}
      </Grid>
      <Grid item>
        <EditInput id={id} value={value} edit={edit} onChange={onChange} />
      </Grid>
    </Grid>
  );
}

export default InfoItem;
