import {NextApiRequest, NextApiResponse} from "next";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {POSTGRES_USER, POSTGRES_PASSWORD, step_nb} = req.body;

  if (
    notNonEmptyString(POSTGRES_USER) ||
    notNonEmptyString(POSTGRES_PASSWORD)
  ) {
    res.status(400).json({status: "fail", error: "Input data error"});
    return;
  }

  try {
    addEnvVar("POSTGRES_USER", POSTGRES_USER);
    addEnvVar("POSTGRES_PASSWORD", POSTGRES_PASSWORD);

    finishedStep(step_nb);
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
