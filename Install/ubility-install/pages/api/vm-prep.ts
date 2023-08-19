import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {finishedStep} from "./utils/helperFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {step_nb} = req.body;

  const {pass, result} = await BashExec(`sh pages/api/scripts/vm-prep.sh`, res);
  if (!result.error) finishedStep(step_nb);

  res.status(pass ? 200 : 500).json({
    status: pass ? "pass" : "fail",
    result: result,
  });
}
