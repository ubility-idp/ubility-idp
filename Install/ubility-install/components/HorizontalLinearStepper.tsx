import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import InstallStep from "./InstallStep";
import steps from "../static/steps";
import {ReactNode, useState} from "react";
import {Button, Link, Step} from "@mui/material";

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const vm_address = origin.split(":3000")[0].split("http://")[1];

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const unFinishStep = async (step: number) => {
    const res = await fetch(`/api/undoStepFinish`, {
      method: "POST",
      body: JSON.stringify({
        step: step,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    await res.json();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      unFinishStep(prevActiveStep - 1);
      return prevActiveStep - 1;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{width: "100%"}}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps
          .sort((a, b) => a.nb - b.nb)
          .map((step, index) => {
            const stepProps: {completed?: boolean} = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={step.label} {...stepProps}>
                <StepLabel {...labelProps}>{step.label}</StepLabel>
              </Step>
            );
          })}
      </Stepper>
      {steps
        .sort((a, b) => a.nb - b.nb)
        .map((step, i) => (
          <div key={i} className={`${step.nb !== activeStep && "hidden"}`}>
            <InstallStep
              step={step}
              handleNext={handleNext}
              handleReset={handleReset}
              handleBack={handleBack}
              activeStep={activeStep}
              stepsNb={steps.length}
            />
          </div>
        ))}

      {activeStep == steps.length && (
        <div className="flex justify-between mt-5 items-end">
          <div className="flex flex-col gap-2">
            <Typography variant="h5">
              OpenOps Installation is complete
            </Typography>
            <div className="flex gap-3">
              <Typography variant="h6">
                You can now open OpenOps using this link:
              </Typography>
              <Link
                className="text-xl"
                target="_blank"
                href={`http://${vm_address}:7007`}
              >
                {`http://${vm_address}:7007`}
              </Link>
            </div>
          </div>
          <div>
            <Button
              color="inherit"
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{mr: 1}}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </Box>
  );
}
