import {NextApiRequest, NextApiResponse} from "next";

import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);

  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, step_nb} = req.body;

  if (
    notNonEmptyString(GITHUB_CLIENT_ID) &&
    notNonEmptyString(GITHUB_CLIENT_SECRET)
  ) {
    res.status(400).json({status: "fail", error: "Input data error"});
    return;
  } else {
    let pass = false;
    pass = addEnvVar("GITHUB_CLIENT_ID", GITHUB_CLIENT_ID);
    pass = addEnvVar("GITHUB_CLIENT_SECRET", GITHUB_CLIENT_SECRET);
    finishedStep(step_nb);

    res.status(200).json({
      status: "pass",
      result: {
        error: !pass,
        stdout: "",
        stderr: "",
      },
    });
  }
}
