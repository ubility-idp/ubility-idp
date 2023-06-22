import React, {ReactNode} from "react";

interface Props {
  stepNumber: number;
}

export default function InstallStep({stepNumber}: Props) {
  return <div className="my-12">{`InstallStep ${stepNumber + 1}`}</div>;
}
