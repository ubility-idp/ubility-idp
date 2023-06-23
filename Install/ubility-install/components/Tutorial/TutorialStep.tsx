import {TutStep} from "@/static/steps";
import {Typography} from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  tutStep: TutStep;
};

function TutorialStep({tutStep}: Props) {
  return (
    <div>
      <Typography className="text-xl my-2">
        {`${tutStep.nb + 1}) ${tutStep.title}`}
      </Typography>
      <div className="pl-6 flex flex-col gap-2 mb-2">
        {tutStep.instructions.map((inst, i) => (
          <Typography className="text-lg text-gray-600" key={i}>
            {`- ${inst}`}
          </Typography>
        ))}
      </div>
      <Image
        src={tutStep.image}
        width={1920}
        height={1080}
        alt={tutStep.title}
      />
    </div>
  );
}

export default TutorialStep;
