import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = (Math.random() + 1).toString(36).substring(7);

  console.log(secret);

  const pass = BashExec(
    `sh pages/api/scripts/automation-setup.sh '${secret}'`,
    res
  );
  if (pass) {
    addEnvVar("JWT_SECRET", secret);
  }
  finishedStep(3);
}
