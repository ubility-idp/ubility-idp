import React from 'react';
import { FieldProps } from '@rjsf/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { Select, MenuItem } from '@material-ui/core';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

interface Size {
  name: string;
  value: string;
}

export const NodePoolSize = ({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldProps<any>) => {
  const discoveryApi = useApi(discoveryApiRef);

  const { fetch } = useApi(fetchApiRef);
  useAsync(async (): Promise<void> => {
    if (formData.regions?.length > 0) return;
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/get_azure_regions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    onChange({
      ...formData,
      regions: data.regions,
    });
  }, []);

  useAsync(async (): Promise<void> => {
    if (formData.sizes?.length > 0) return;
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/get_node_pool_sizes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        region: formData.region,
      }),
    });
    const data = await response.json();
    onChange({
      ...formData,
      sizes: data.sizes,
    });
  }, [formData.region]);

  return (
    <>
      <FormControl
        margin="normal"
        required={required}
        error={rawErrors?.length > 0 && !formData}
      >
        <InputLabel id="regionLabel">Region</InputLabel>
        <Select
          labelId="regionLabel"
          id="region"
          value={formData.region}
          label="Region"
          onChange={e => {
            onChange({
              ...formData,
              region: e.target?.value as string,
              size: '',
            });
            // setSelectedRegion(e.target?.value as string);
          }}
        >
          {formData.regions?.length > 0
            ? formData.regions.map(
                (reg: string, i: React.Key | null | undefined) => {
                  return (
                    <MenuItem key={i} value={reg}>
                      {reg}
                    </MenuItem>
                  );
                },
              )
            : []}
        </Select>
      </FormControl>
      <FormControl
        margin="normal"
        required={required}
        error={rawErrors?.length > 0 && !formData}
      >
        <InputLabel id="nodePoolSizeLabel">Node Pool Size</InputLabel>
        <Select
          labelId="nodePoolSizeLabel"
          id="nodePoolSize"
          value={formData.size}
          label="Node Pool Size"
          onChange={e => {
            onChange({
              ...formData,
              size: e.target?.value as string,
            });
            // setSelectedSize(e.target?.value as string);
          }}
        >
          {formData.sizes
            ? formData.sizes.map(
                (size: Size, i: React.Key | null | undefined) => {
                  return (
                    <MenuItem key={i} value={size.value}>
                      {size.name}
                    </MenuItem>
                  );
                },
              )
            : []}
        </Select>
      </FormControl>
    </>
  );
};
