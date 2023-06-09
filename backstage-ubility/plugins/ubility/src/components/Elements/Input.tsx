import { Box, Paper, TextField, Typography } from '@material-ui/core';
import React from 'react';

type Props = {
  value: string;
  edit: boolean;
  id: string;
  onChange: Function;
};

function EditInput({ value, edit, onChange, id }: Props) {
  if (!edit) {
    return (
      <Paper>
        <Box sx={{ py: 0.7, px: 1.5 }}>
          <Typography variant="subtitle2">{value}</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <TextField
      size="small"
      value={value}
      onChange={e => onChange(e, id)}
      variant="outlined"
    />
  );
}

export default EditInput;
