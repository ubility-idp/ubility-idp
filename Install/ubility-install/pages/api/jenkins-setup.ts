import {NextApiRequest, NextApiResponse} from "next";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {JENKINS_API_TOKEN, JENKINS_USERNAME} = req.body;

  if (
    notNonEmptyString(JENKINS_API_TOKEN) ||
    notNonEmptyString(JENKINS_USERNAME)
  ) {
    res.status(400).json({status: "fail", error: "Input data error"});
    return;
  }

  try {
    const VM_ADDRESS = req.headers.host?.split(":3000")[0];

    addEnvVar("JENKINS_API_TOKEN", JENKINS_API_TOKEN);
    addEnvVar("JENKINS_ADDRESS", `http://${VM_ADDRESS}:8080`);
    addEnvVar("JENKINS_USERNAME", JENKINS_USERNAME);

    addEnvVar("VM_ADDRESS", `${VM_ADDRESS}`);
    addEnvVar("APP_BASE_URL", `http://${VM_ADDRESS}:7007`);
    addEnvVar("BACKEND_BASE_URL", `http://${VM_ADDRESS}:7007`);
    addEnvVar("ORIGIN", `http://${VM_ADDRESS}:7007`);

    finishedStep(1);
    res
      .status(200)
      .json({status: "pass", result: {error: false, stdout: "", stderr: ""}});
  } catch (error) {
    console.log(`Error saving env vars to json file: ${error}`);

    res.status(500).json({
      status: "fail",
      error: `Error saving env vars to json file: ${error}`,
    });
  }
}
