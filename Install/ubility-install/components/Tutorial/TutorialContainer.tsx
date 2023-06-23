import {Step} from "@/static/steps";
import React, {ReactNode} from "react";
import TutorialStep from "./TutorialStep";
import {Paper, Typography} from "@mui/material";

interface Props {
  step: Step;
}

function TutorialContainer({step}: Props) {
  return (
    <div className="w-full flex flex-col">
      <Typography className="text-xl my-2">{step.tutorial?.title}</Typography>
      <div className="max-w-5xl flex flex-col gap-10">
        {step.tutorial?.steps.map((tutStep, i) => (
          <TutorialStep tutStep={tutStep} key={i} />
        ))}
      </div>
    </div>
  );
}

export default TutorialContainer;
