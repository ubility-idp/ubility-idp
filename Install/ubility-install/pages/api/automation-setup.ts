import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = (Math.random() + 1).toString(36);
  const {pass, result} = await BashExec(
    `sh pages/api/scripts/automation-setup.sh '${secret}'`,
    res
  );

  res.status(pass ? 200 : 500).json({
    status: pass ? "pass" : "fail",
    result: result,
  });
  finishedStep(3);
}
