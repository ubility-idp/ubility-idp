import React, {ReactNode, useState} from "react";
import {Step} from "../static/steps";
import {Controller, useForm} from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import TutorialContainer from "./Tutorial/TutorialContainer";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({error: false, message: ""});
  const {
    handleSubmit,
    register,
    control,
    formState: {errors},
  } = useForm();
  const onSubmit = async (data: any) => {
    setLoading(true);
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
    const result = await res.json();
    if (result.status === "pass")
      setError({error: result.result.error, message: result.result.stderr});
    else {
      try {
        setError({error: true, message: result?.result?.error});
      } catch (error) {
        setError({error: true, message: "Internal server error"});
      }
    }
    setLoading(false);
    if (result.result.error === false) handleNext();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-6 px-12">
          <div className="my-6">{loading && <LinearProgress />}</div>
          <div className="my-6">
            {error.error && <Alert severity="error">{error.message}</Alert>}
          </div>
          <div className="flex flex-col gap-5">
            {step.inputs.map((input, i) => (
              <Controller
                key={i}
                name={input.id}
                control={control}
                render={({field: {onChange, value}}) => (
                  <>
                    <TextField
                      className=""
                      required
                      id={input.id}
                      {...register("name", {required: true})}
                      onChange={onChange}
                      value={value === undefined ? "" : value}
                      label={input.label}
                    />
                    {errors?.[input.id] &&
                      errors?.[input.id]?.type === "required" && (
                        <span>This is required</span>
                      )}
                  </>
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
                  <Button type="submit">
                    {activeStep === stepsNb - 1 ? "Finish" : "Next"}
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </div>
      </form>
      <TutorialContainer step={step} />
    </>
  );
}
