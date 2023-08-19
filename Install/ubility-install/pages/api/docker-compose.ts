import * as fs from "fs";
import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {convertEnvJSONtoEnvFile, finishedStep} from "./utils/helperFunctions";

interface Idictionary {
  [key: string]: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {step_nb} = req.body;

  const {pass, result} = await BashExec(
    `sh pages/api/scripts/docker-compose.sh`,
    res
  );
  if (!result.error) finishedStep(step_nb);

  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    convertEnvJSONtoEnvFile(content);

    res.status(pass ? 200 : 500).json({
      status: pass ? "pass" : "fail",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      result: "Internal server error",
    });
  }
}
