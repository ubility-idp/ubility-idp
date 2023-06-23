import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";

function notNonEmptyString(variable: any): boolean {
  if (typeof variable === "string" && variable.trim().length > 0) {
    return false;
  }
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);

  if (req.body === undefined)
    res.status(200).json({status: "fail", error: "No body sent"});

  const {GITHUB_USERNAME, GITHUB_TOKEN} = req.body;

  if (notNonEmptyString(GITHUB_USERNAME) && notNonEmptyString(GITHUB_TOKEN)) {
    res.status(200).json({status: "fail", error: "Input data error"});
    return;
  }

  BashExec(
    `echo GITHUB_USERNAME=${GITHUB_USERNAME} GITHUB_TOKEN=${GITHUB_TOKEN}`,
    res
  );
}
