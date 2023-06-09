import { Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import React from 'react';

type Props = {
  edit: boolean;
  onEdit: Function;
  onSave: Function;
  saving: boolean;
  setEdit: Function;
  setReloadAll: Function;
};

function EditControls({
  edit,
  onEdit,
  onSave,
  saving,
  setEdit,
  setReloadAll,
}: Props) {
  if (saving) {
    return <Typography>Saving...</Typography>;
  }

  return (
    <ButtonGroup>
      {!edit ? (
        <Button variant="outlined" onClick={() => onEdit(true)}>
          Edit
        </Button>
      ) : (
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => {
                onEdit(false);
                setReloadAll((prev: boolean) => !prev);
              }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => {
                setEdit(false);
                onSave();
              }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      )}
    </ButtonGroup>
  );
}

export default EditControls;
