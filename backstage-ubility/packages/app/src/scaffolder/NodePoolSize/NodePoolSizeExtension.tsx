import React, { useState } from 'react';
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

  const [regions, setRegions] = useState(
    formData.region ? [formData.region] : [],
  );

  const [nodePoolSizes, setNodePoolSizes] = useState([
    { value: formData.size, name: formData.size_display_name },
  ]);

  const { fetch } = useApi(fetchApiRef);
  useAsync(async (): Promise<void> => {
    const baseUrl = await discoveryApi.getBaseUrl('ubility');
    const response = await fetch(`${baseUrl}/get_azure_regions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setRegions(data.regions);
  }, []);

  useAsync(async (): Promise<void> => {
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
    setNodePoolSizes(data.sizes);
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
          value={formData.region ? formData.region : ''}
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
          {regions.map((reg: string, i: React.Key | null | undefined) => {
            return (
              <MenuItem key={i} value={reg}>
                {reg}
              </MenuItem>
            );
          })}
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
          value={formData.size ? formData.size : ''}
          label="Node Pool Size"
          onChange={e => {
            const selectedValue = e.target.value as string;
            const selectedOption = nodePoolSizes.find(
              size => size.value === selectedValue,
            );
            const displayName = selectedOption ? selectedOption.name : '';

            onChange({
              ...formData,
              size: e.target?.value as string,
              size_display_name: displayName,
            });
            // setSelectedSize(e.target?.value as string);
          }}
        >
          {nodePoolSizes.map((size: Size, i: React.Key | null | undefined) => {
            return (
              <MenuItem key={i} value={size.value}>
                {size.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};
