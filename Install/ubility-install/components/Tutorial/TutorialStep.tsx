import {TutStep} from "@/static/steps";
import {Link, Paper, Typography} from "@mui/material";
import Image from "next/image";
import React, {useEffect, useState} from "react";

type Props = {
  tutStep: TutStep;
  jenkins_admin_pass: string;
};

function TutorialStep({tutStep, jenkins_admin_pass}: Props) {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const vm_address = origin.split(":3000")[0].split("http://")[1];

  const [tutInstructions, setTutInstructions] = useState<string[]>([]);

  const [linkText, setlinkText] = useState<
    {url: string; title: string} | undefined
  >(tutStep.link);

  useEffect(() => {
    setTutInstructions(
      tutStep.instructions.map(
        (inst) => `- ${inst.replace("<VM_ADDRESS>", vm_address)}`
      )
    );
  }, [tutStep.instructions, vm_address]);

  useEffect(() => {
    setTutInstructions(
      tutStep.instructions.map(
        (inst) =>
          `- ${inst.replace("<jenkins_admin_pass>", jenkins_admin_pass)}`
      )
    );
  }, [tutStep.instructions, jenkins_admin_pass]);

  useEffect(() => {
    if (vm_address && tutStep.link) {
      setlinkText({
        url: tutStep.link.url.replace("<VM_ADDRESS>", vm_address),
        title: tutStep.link.title.replace("<VM_ADDRESS>", vm_address),
      });
    }
  }, [tutStep.link, vm_address]);

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
          <Link target="_blank" href={linkText?.url}>
            {linkText?.title}
          </Link>
        )}
      </div>
      <div className="pl-6 flex flex-col gap-2 mb-2">
        {tutInstructions.map((inst, i) => (
          <Typography className="text-gray-600" key={i}>
            {inst}
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
