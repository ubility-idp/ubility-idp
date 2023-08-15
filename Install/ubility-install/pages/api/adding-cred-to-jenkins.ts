import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {addEnvVar, finishedStep} from "./utils/helperFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const host = req.headers.host?.split(":3000")[0];

  console.log(host);

  const {pass, result, error} = await BashExec(
    `sh pages/api/scripts/adding-cred-to-jenkins.sh '${host}'`,
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
