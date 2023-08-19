import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
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

  const {RESOURCE_GROUP, CONTAINER_REGISTRY, step_nb} = req.body;

  if (
    notNonEmptyString(RESOURCE_GROUP) ||
    notNonEmptyString(CONTAINER_REGISTRY)
  ) {
    res.status(400).json({status: "fail", error: "Input data error"});
    return;
  }

  try {
    const {pass, result} = await BashExec(
      `sh pages/api/scripts/terraform-vars.sh '${RESOURCE_GROUP}' '${CONTAINER_REGISTRY}'`,
      res
    );

    if (result.stderr != "") result.error = true;

    if (pass) {
      addEnvVar("RESOURCE_GROUP", RESOURCE_GROUP);
      addEnvVar("CONTAINER_REGISTRY", CONTAINER_REGISTRY);
      finishedStep(step_nb);
    }

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
