import * as fs from "fs";
import {NextApiRequest, NextApiResponse} from "next";

import {checkStepStatus, notNonEmptyString} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {env_vars, step} = req.body;

  if (env_vars === undefined)
    res.status(400).json({status: "fail", error: "No env_vars"});

  let step_finished = true;

  try {
    const filePath = "./env_vars.json";
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const values = [];

    for (let env_var of env_vars) {
      if (notNonEmptyString(env_var)) {
        res.status(400).json({status: "fail", error: "Input data error"});
        break;
      }
      if (!(env_var in content)) {
        step_finished = false;
      } else {
        if (notNonEmptyString(content[env_var])) {
          step_finished = false;
        } else {
          values.push([env_var, content[env_var]]);
        }
      }
    }
    const step_done = checkStepStatus(step);

    res.status(200).json({status: "pass", step_done, values: values});
  } catch (error) {
    res.status(500).json({status: "fail", error: error});
  }
}
