import {TutStep} from "@/static/steps";
import {Link, Paper, Typography} from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  tutStep: TutStep;
};

function TutorialStep({tutStep}: Props) {
  return (
    <Paper className="px-6 py-2">
      <div
        id={`${tutStep.input_link}-tut-step`}
        className="flex gap-4 items-center my-2"
      >
        <Typography className="text-lg ">{`${tutStep.nb + 1}) ${
          tutStep.title
        }`}</Typography>
        {tutStep.link && (
          <Link target="_blank" href={tutStep.link.url}>
            {tutStep.link.title}
          </Link>
        )}
      </div>
      <div className="pl-6 flex flex-col gap-2 mb-2">
        {tutStep.instructions.map((inst, i) => (
          <Typography className="text-gray-600" key={i}>
            {`- ${inst}`}
          </Typography>
        ))}
      </div>
      <hr />
      <Image
        src={tutStep.image}
        width={1920}
        height={1080}
        alt={tutStep.title}
      />
    </Paper>
  );
}

export default TutorialStep;
