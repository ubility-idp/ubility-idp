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
  onConfirm: () => any;
  deleting: boolean;
};

const ClusterDeleteDialog = ({ deleting, onCancel, onConfirm }: Props) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const confirmDialog = () => {
    closeDialog();
    onConfirm();
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
        <DialogContent>{dialogContent()}</DialogContent>
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
