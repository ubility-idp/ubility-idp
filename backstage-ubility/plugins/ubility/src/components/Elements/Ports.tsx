import React from 'react';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import { Port } from '../Service/types';
import InfoItem from './InfoElement';

export type Props = {
  edit: boolean;
  setEdit: Function;
  setPorts: Function;
  ports: Port[];
};

function isStringInteger(value: string): boolean {
  const integerRegex = /^\d+$/; // Regex pattern for one or more digits

  return integerRegex.test(value);
}

function Ports({ ports, edit, setPorts }: Props) {
  const changeHandler = (
    event: { target: { value: any } },
    id: number,
    field: string,
    isNumber: boolean = false,
  ) => {
    setPorts((prev: Port[]) => {
      const index = prev.findIndex(p => p.id === id);
      const updatedPorts = [...prev];
      const value = event.target.value;
      if (isNumber) {
        if (!isStringInteger(value) && value !== '') {
          return prev;
        }

        updatedPorts[index][field] = value === '' ? value : parseInt(value, 10);
        return updatedPorts;
      }

      updatedPorts[index][field] = value;
      return updatedPorts;
    });
  };

  const addPort = () => {
    setPorts((prev: Port[]) => [
      ...prev,
      { id: prev.length, name: '', port: '', protocol: '', targetPort: '' },
    ]);
  };

  const deletePort = (id: number) => {
    setPorts((prev: Port[]) => {
      return prev.filter(p => p.id !== id);
    });
  };

  return (
    <Grid alignItems="center" container spacing={2}>
      <Grid item>
        <Grid alignItems="center" container spacing={2}>
          <Grid item>
            <Typography>Ports:</Typography>
          </Grid>
          <Grid item>
            {edit && (
              <Button
                color="primary"
                size="small"
                variant="outlined"
                onClick={addPort}
              >
                Add Port
              </Button>
            )}
          </Grid>
        </Grid>
        <Grid alignItems="center" container spacing={1}>
          {ports.map((port: Port) => {
            return (
              <Grid item>
                <Paper>
                  <Box sx={{ p: 2, m: 1 }}>
                    <InfoItem
                      title="Name"
                      value={port.name}
                      id={port.id.toString()}
                      onChange={(e: { target: { value: any } }) =>
                        changeHandler(e, port.id, 'name')
                      }
                      edit={edit}
                      compact
                    />
                    <InfoItem
                      title="Port"
                      value={port.port.toString()}
                      id={port.id.toString()}
                      onChange={(e: { target: { value: any } }) =>
                        changeHandler(e, port.id, 'port', true)
                      }
                      edit={edit}
                      compact
                    />
                    <InfoItem
                      title="Protocol"
                      value={port.protocol}
                      id={port.id.toString()}
                      onChange={(e: { target: { value: any } }) =>
                        changeHandler(e, port.id, 'protocol')
                      }
                      edit={edit}
                      compact
                    />
                    <InfoItem
                      title="Target Port"
                      value={port.targetPort.toString()}
                      id={port.id.toString()}
                      onChange={(e: { target: { value: any } }) =>
                        changeHandler(e, port.id, 'targetPort', true)
                      }
                      edit={edit}
                      compact
                    />
                    {edit && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          color="secondary"
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            deletePort(port.id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Ports;
