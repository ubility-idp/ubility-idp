import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = (Math.random() + 1).toString(36);

  console.log(secret);

  BashExec(`sh pages/api/scripts/automation-setup.sh '${secret}'`, res);

  finishedStep(3);
}
