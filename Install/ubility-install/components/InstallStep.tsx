import React, {ReactNode} from "react";
import {Step} from "../static/steps";
import {Controller, useForm} from "react-hook-form";
import {Box, Button, TextField, Typography} from "@mui/material";

interface Props {
  step: Step;
  handleNext: () => void;
  handleReset: () => void;
  handleBack: () => void;
  activeStep: number;
  stepsNb: number;
}

export default function InstallStep({
  step,
  handleNext,
  handleReset,
  handleBack,
  activeStep,
  stepsNb,
}: Props) {
  const {handleSubmit, reset, control} = useForm();
  const onSubmit = async (data: any) => {
    handleNext();
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
        {activeStep === stepsNb ? (
          <>
            <Typography sx={{mt: 2, mb: 1}}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
              <Box sx={{flex: "1 1 auto"}} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-52">
              <Box sx={{display: "flex", flexDirection: "row", pt: 2}}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{mr: 1}}
                >
                  Back
                </Button>
                <Box sx={{flex: "1 1 auto"}} />
                <Button onClick={handleSubmit(onSubmit)}>
                  {activeStep === stepsNb - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
