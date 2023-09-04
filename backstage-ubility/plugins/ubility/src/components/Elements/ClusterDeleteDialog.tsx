import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import React, { useState } from 'react';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type Props = {
  cluster_name: string;
  repo_loc: string;
};

const ClusterDeleteDialog = ({ cluster_name, repo_loc }: Props) => {
  const navigate = useNavigate();

  const discoveryApi = useApi(discoveryApiRef);
  const catalogApi = useApi(catalogApiRef);

  const [deleting, setDeleting] = useState({
    error: false,
    deleting: false,
    success: false,
    error_message: '',
  });
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const deleteHandler = async () => {
    const ubility_baseUrl = await discoveryApi.getBaseUrl('ubility');
    console.log(`Deleting ${cluster_name} cluster`);

    setDeleting({
      error: false,
      deleting: true,
      success: false,
      error_message: '',
    });
    try {
      const response = await fetch(`${ubility_baseUrl}/delete_cluster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster_name: cluster_name,
        }),
      });
      const result = await response.json();
      console.log(result);

      const task_id = result.task_id;

      let status = 'STARTED';
      let res_get_delete;

      while (status === 'STARTED' || status === 'PENDING') {
        const res = await fetch(`${ubility_baseUrl}/delete_cluster_status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task_id,
          }),
        });
        res_get_delete = await res.json();
        console.log({ res_get_delete });
        status = res_get_delete.flow_status;
        console.log({ type: 'get_res', status });

        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      status = res_get_delete?.data?.Status;
      if (status === 'FAIL')
        setDeleting(prev => {
          return { ...prev, error: true };
        });
      if (status === undefined) {
        if ('success' in res_get_delete) {
          const location = await catalogApi.getLocationByRef(repo_loc);
          const entity_id = location?.id || '';
          catalogApi.removeLocationById(entity_id);
          navigate('/catalog');
        }
      }
      setDeleting({
        error: false,
        deleting: false,
        success: true,
        error_message: '',
      });
    } catch (error) {
      setDeleting({
        error: true,
        deleting: false,
        success: false,
        error_message: `Error: ${error}`,
      });
    }
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    deleteHandler();
  };

  return (
    <>
      <Button color="secondary" variant="contained" onClick={openDialog}>
        Delete
      </Button>
      <Dialog
        open={open}
        onClose={closeDialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">
          Delete Cluster
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ul>
            <li>
              <Typography>Deleting the cluster on Azure is undoable</Typography>
            </li>
            <li>
              <Typography>
                This will remove the AKS and all nodes under it and any running
                services will be gone
              </Typography>
            </li>
            <li>
              <Typography>
                This action does not delete the AKS terraform files on GitHub
              </Typography>
            </li>
            <li>
              <Typography>
                This action also deletes this entity and its origin location
                from the software Catalog
              </Typography>
            </li>
          </ul>
          {deleting.error ? (
            <div className="bg-red-500">
              <Alert severity="error">{deleting.error_message}</Alert>
            </div>
          ) : deleting.deleting ? (
            <Progress />
          ) : (
            deleting.success && <Alert>Cluster deleted successfully</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={confirmDialog}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClusterDeleteDialog;
