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

// type RegiosRes = {
//   regions: Object[];
// };

export const Region = ({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldProps<string>) => {
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const discoveryApi = useApi(discoveryApiRef);

  const { fetch } = useApi(fetchApiRef);
  useAsync(async (): Promise<void> => {
    setRegions([]);
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

  // const getRegions = async () => {
  //   try {
  //     const response = await axios.get(`${vm_address}/backstage/regions`);
  //     const regs = response.data.regions.map((reg: { Region: any }) => {
  //       return reg.Region;
  //     });
  //     setRegions(regs.sort());
  //   } catch (error) {
  //     setRegions([]);
  //   }
  // };

  // useEffect(() => {
  //   getRegions();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [setRegions]);

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      <InputLabel id="regionLabel">Region</InputLabel>
      <Select
        labelId="regionLabel"
        id="region"
        value={selectedRegion}
        label="Region"
        onChange={e => {
          setSelectedRegion(e.target?.value as string);
          onChange(e.target?.value);
        }}
      >
        {regions.map((reg, i) => {
          return (
            <MenuItem key={i} value={reg}>
              {reg}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
