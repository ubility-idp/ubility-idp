import * as fs from "fs";
import {NextApiRequest, NextApiResponse} from "next";

import {notNonEmptyString} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {env_vars} = req.body;

  if (env_vars === undefined)
    res.status(400).json({status: "fail", error: "No env_vars"});

  let step_finished = true;

  try {
    const filePath = "./env_vars.json";
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (let env_var of env_vars) {
      if (notNonEmptyString(env_var)) {
        res.status(400).json({status: "fail", error: "Input data error"});
        break;
      }
      if (!(env_var in content)) {
        step_finished = false;
        break;
      } else {
        if (notNonEmptyString(content[env_var])) {
          step_finished = false;
          break;
        }
      }
    }
    res.status(200).json({status: "pass", step_finished});
  } catch (error) {
    res.status(500).json({status: "fail", error: error});
  }
}
