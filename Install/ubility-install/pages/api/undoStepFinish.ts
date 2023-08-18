import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {finishedStep, unFinishStep} from "./utils/helperFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {step} = req.body;

  unFinishStep(step);

  res.status(200).json({
    status: "pass",
  });
}
