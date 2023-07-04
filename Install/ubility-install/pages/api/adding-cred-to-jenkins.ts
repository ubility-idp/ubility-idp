import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {addEnvVar, finishedStep} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host?.split(":3000")[0];

  console.log(host);

  BashExec(`sh pages/api/scripts/adding-cred-to-jenkins.sh '${host}'`, res);

  finishedStep(3);
}
