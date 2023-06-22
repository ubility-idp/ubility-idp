"use client";
import HorizontalLinearStepper from "@/components/HorizontalLinearStepper";
import StepsContainer from "@/components/StepsContainer";
import {Step, StepLabel, Stepper} from "@mui/material";

export default function Home() {
  return (
    <StepsContainer>
      <HorizontalLinearStepper />
    </StepsContainer>
  );
}
