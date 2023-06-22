import React, {ReactNode} from "react";
import {Step} from "./steps";
import {Controller, useForm} from "react-hook-form";
import {Button, TextField} from "@mui/material";

interface Props {
  step: Step;
}

export default function InstallStep({step}: Props) {
  const {handleSubmit, reset, control} = useForm();
  const onSubmit = async (data: any) => {
    console.log(data);
    const input_json: any = {};
    step.inputs.forEach((input) => (input_json[input.id] = data[input.id]));
    const res = await fetch(`/api/${step.api_endpoint}`, {
      method: "POST",
      body: JSON.stringify(input_json),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    console.log(await res.json());
  };

  return (
    <form>
      <div className="my-6 px-12">
        <div className="flex flex-col gap-5">
          {step.inputs.map((input, i) => (
            <Controller
              key={i}
              name={input.id}
              control={control}
              render={({field: {onChange, value}}) => (
                <TextField
                  onChange={onChange}
                  value={value === undefined ? "" : value}
                  label={input.label}
                />
              )}
            />
          ))}
        </div>
        {/* <div className="flex mt-8 w-fit">
          <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
          <Button onClick={() => reset()} variant={"outlined"}>
            Reset
          </Button>
        </div> */}
      </div>
    </form>
  );
}
