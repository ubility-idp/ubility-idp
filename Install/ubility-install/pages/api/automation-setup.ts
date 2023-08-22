import {NextApiRequest, NextApiResponse} from "next";
import * as crypto from "crypto";
import {addEnvVar, finishedStep} from "./utils/helperFunctions";

var jwt = require("jsonwebtoken");

function generateJWTSecret() {
  const secretLength = 32;
  return crypto.randomBytes(secretLength).toString("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {step_nb} = req.body;

  const secret = generateJWTSecret();

  try {
    const token = jwt.sign({id: "0", name: "OpenOps Default User"}, secret);

    console.log({secret, token});

    addEnvVar("AUTOMATION_SECRET_KEY", secret);
    addEnvVar("AUTOMATION_SERVER_JWT", token);

    finishedStep(step_nb);

    res.status(200).json({
      status: "pass",
      result: {error: false, result: token},
    });
  } catch (error) {
    res.status(200).json({
      status: "pass",
      result: {error: true, result: error},
    });
  }
}
