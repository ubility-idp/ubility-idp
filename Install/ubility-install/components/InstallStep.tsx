import React, {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
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
import Link from "next/link";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
    setError({error: false, message: ""});
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

  const formRef: MutableRefObject<HTMLFormElement | null> = useRef(null);

  useEffect(() => {
    if (formRef.current !== null) {
      if (activeStep === step.nb && step.inputs.length === 0) {
        onSubmit({});
      }
    }
  }, [activeStep, step.inputs.length, step.nb]);

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className="my-8 px-2 md:px-12">
          <div className="w-full flex justify-center">
            <Typography className="text-2xl">{step.label}</Typography>
          </div>
          <div className="my-6">{loading && <LinearProgress />}</div>
          <div className="my-6">
            {error.error && <Alert severity="error">{error.message}</Alert>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {step.inputs.map((input, i) => (
              <Controller
                key={i}
                name={input.id}
                control={control}
                render={({field: {onChange, value}}) => (
                  <div className="relative">
                    <TextField
                      className="w-full"
                      type={input.type}
                      onFocus={() => {
                        if (error.error) setError({error: false, message: ""});
                      }}
                      required
                      id={input.id}
                      {...register(input.id, {required: true})}
                      onChange={onChange}
                      value={value === undefined ? "" : value}
                      label={input.label}
                    />
                    {errors?.[input.id] &&
                      errors?.[input.id]?.type === "required" && (
                        <span>This is required</span>
                      )}
                    <div className="absolute inset-y-0 right-5 flex items-center">
                      <Link href={`/#${input.id}-tut-step`}>
                        <HelpOutlineIcon color="info" />
                      </Link>
                    </div>
                  </div>
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
              <div className="flex justify-between w-full max-w-sm mt-5">
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{mr: 1}}
                >
                  Back
                </Button>
                <Button variant="text" onClick={handleNext}>
                  Skip
                </Button>
                <Button variant="outlined" type="submit">
                  {activeStep === stepsNb - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
      <TutorialContainer step={step} />
    </>
  );
}
