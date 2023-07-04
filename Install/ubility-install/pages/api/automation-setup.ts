import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // BashExec(
  //   `echo GITHUB_USERNAME=${GITHUB_USERNAME} GITHUB_TOKEN=${GITHUB_TOKEN}`,
  //   res
  // );
  finishedStep(3);
}
