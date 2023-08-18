import * as fs from "fs";

import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {convertEnvJSONtoEnvFile} from "./utils/helperFunctions";

interface Idictionary {
  [key: string]: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const host = req.headers.host?.split(":3000")[0];

  console.log(host);

  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    convertEnvJSONtoEnvFile(content);

    console.log("before bash");

    const {pass, result} = await BashExec(
      `sh pages/api/scripts/adding-cred-to-jenkins.sh '${host}'`,
      res
    );
    console.log("after bash");

    console.log(result);

    if (result.stderr != "") result.error = true;

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
