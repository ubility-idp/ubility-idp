import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {Step} from "../static/steps";
import {Controller, useForm} from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import TutorialContainer from "./Tutorial/TutorialContainer";
import Link from "next/link";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {Visibility, VisibilityOff} from "@mui/icons-material";

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
  const [jenkins_admin_pass, setJenkins_admin_pass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    formState: {errors},
  } = useForm();
  const onSubmit = async (data: any) => {
    setLoading(true);
    setError({error: false, message: ""});
    // console.log(data);
    const input_json: any = {};
    step.inputs.forEach((input) => (input_json[input.id] = data[input.id]));
    const res = await fetch(`/api/${step.api_endpoint}`, {
      method: "POST",
      body: JSON.stringify({...input_json, step_nb: step.nb}),
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
  console.log(errors);

  const formRef: MutableRefObject<HTMLFormElement | null> = useRef(null);

  const fetchStepStatus = async () => {
    const res = await fetch(`/api/check-step-completion`, {
      method: "POST",
      body: JSON.stringify({
        env_vars: step.inputs.map((input) => input.id),
        step: step.nb,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const result = await res.json();
    if (result.status === "pass") {
      // console.log(result.values);

      result.values.forEach((val: any[]) => {
        setValue(val[0], val[1]);
      });

      if (result.step_done === "yes") {
        handleNext();
      }
    }
  };

  const fetchJenkinsAdminPassword = async () => {
    const res = await fetch(`/api/get-jenkins-admin-password`, {
      method: "GET",
    });
    const result = await res.json();
    if (result.status === "pass") {
      setJenkins_admin_pass(result.result.stdout);
    } else {
      setJenkins_admin_pass("");
    }
  };

  useEffect(() => {
    if (activeStep === step.nb) {
      if (step.nb === 0) {
        fetchJenkinsAdminPassword();
      }
      fetchStepStatus();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className="my-8 ">
          <div className="flex justify-between items-start gap-10">
            <div className="flex flex-col gap-2">
              <Typography variant="h5">{step.label}</Typography>
              <Typography variant="h6">{step.description}</Typography>
            </div>
            <div className="h-full flex flex-col justify-end">
              <div className="flex justify-between w-full max-w-sm">
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
          </div>
          <div className="my-6">{loading && <LinearProgress />}</div>
          <div className="my-6">
            {error.error && <Alert severity="error">{error.message}</Alert>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {step.inputs.map((input, i) => (
              <Controller
                key={i}
                name={input.id}
                control={control}
                rules={{
                  validate: () => {
                    if (input.validation_regex === undefined) return true;
                    return input.validation_regex.test(getValues(input.id));
                  },
                }}
                render={({field: {onChange, value}}) => (
                  <div className="relative">
                    <TextField
                      className="w-full"
                      type={
                        input.type === "password"
                          ? showPassword
                            ? "text"
                            : "password"
                          : input.type
                      }
                      onFocus={() => {
                        if (error.error) setError({error: false, message: ""});
                      }}
                      id={input.id}
                      {...register(input.id, {required: true})}
                      onChange={onChange}
                      value={value === undefined ? "" : value}
                      label={input.label}
                      error={input.id in errors}
                      helperText={
                        errors?.[input.id]?.type === "required"
                          ? "This field is required"
                          : errors?.[input.id]?.type === "validate" &&
                            input.validation_error_message
                      }
                    />
                    {/* {errors?.[input.id] &&
                      errors?.[input.id]?.type === "required" && (
                        <span>This is required</span>
                      )} */}
                    {/* {input.type === "password" && (
                      <div className="absolute inset-y-0 right-5 flex items-center">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </div>
                    )} */}
                  </div>
                )}
              />
            ))}
          </div>
          {/* {activeStep === stepsNb ? (
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
          )}*/}
        </div>
      </form>
      <TutorialContainer step={step} jenkins_admin_pass={jenkins_admin_pass} />
    </>
  );
}
