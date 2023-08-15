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

  console.log(secret);

  const {pass, result, error} = await BashExec(
    `sh pages/api/scripts/automation-setup.sh '${secret}'`,
    res
  );

  if (pass) {
    res.status(200).json({
      status: "pass",
      result: {error: pass ? false : true, ...result},
    });
  } else {
    res.status(500).json({
      status: "fail",
      error: error,
    });
  }

  finishedStep(3);
}
