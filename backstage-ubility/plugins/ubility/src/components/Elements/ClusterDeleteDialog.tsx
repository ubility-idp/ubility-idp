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
  onCancel: () => any;
  cluster_name: string;
};

const ClusterDeleteDialog = ({ onCancel, cluster_name }: Props) => {
  const discoveryApi = useApi(discoveryApiRef);

  const [deleting, setDeleting] = useState({
    error: true,
    deleting: false,
    success: false,
    error_message: 'Error: omlsk dbo jsegod nr[skdn b[orj bs[ojrsn thb[on ',
  });
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const deleteHandler = async () => {
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    console.log(`Deleting ${cluster_name} cluster`);

    setDeleting({
      error: false,
      deleting: true,
      success: false,
      error_message: '',
    });
    try {
      const response = await fetch(`${baseUrl}/delete_cluster`, {
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
        const res = await fetch(`${baseUrl}/delete_cluster_status`, {
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
      status = res_get_delete.data.Status;
      if (status === 'FAIL')
        setDeleting(prev => {
          return { ...prev, error: true };
        });
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

  const cancelDialog = () => {
    closeDialog();
    onCancel();
  };

  const dialogContent = () => {
    return (
      <>
        <Typography>Delete the cluster</Typography>
        <ul>
          <li>
            <Typography>
              Caution deleting this service will remove its deployment, service
              and ingress from the cluster
            </Typography>
          </li>
        </ul>
      </>
    );
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
          {dialogContent()}
          {deleting.error ? (
            <div className="bg-red-500">
              <Alert severity="error">{deleting.error_message}</Alert>
            </div>
          ) : deleting.deleting ? (
            <Progress />
          ) : (
            <Alert>Cluster deleted successfully</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={cancelDialog}>
            Cancel
          </Button>
          <Button color="secondary" onClick={confirmDialog}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClusterDeleteDialog;
