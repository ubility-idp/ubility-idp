import React, {ReactNode} from "react";

interface Props {
  children?: ReactNode;
}

function StepsContainer({children}: Props) {
  return (
    <div className="w-full px-16 mt-12 outline">
      <div className="w-full">{children}</div>
    </div>
  );
}

export default StepsContainer;
