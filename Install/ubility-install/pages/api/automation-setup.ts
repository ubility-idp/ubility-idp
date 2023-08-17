import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

import * as crypto from "crypto";

function generateToken(secret: string) {
  try {
    const JWT_SECRET = secret;

    const expireSeconds = Number(process.env.JWT_EXPIRATION_IN_SECONDS) || 3600;
    const isSecretBase64Encoded = false;
    const jwtSecret: string = isSecretBase64Encoded
      ? Buffer.from(JWT_SECRET, "base64").toString("utf-8")
      : JWT_SECRET;

    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const payload = {
      id: "0",
      iat: Math.floor(Date.now() / 1000),
      name: "ubility-backstage-user",
      role: "client",
    };

    const headerBase64 = base64UrlEncode(JSON.stringify(header));
    const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
    const signedContent = `${headerBase64}.${payloadBase64}`;
    const signature = base64UrlEncode(
      createHmacSHA256(signedContent, JWT_SECRET)
    );

    const token = `${signedContent}.${signature}`;
    console.log(token);
    return {pass: true, result: token};
  } catch (error) {
    return {pass: false, result: error};
  }
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createHmacSHA256(input: string, key: string): string {
  return crypto.createHmac("sha256", key).update(input).digest("base64");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = (Math.random() + 1).toString(36);
  // const {pass, result} = await BashExec(
  //   `sh pages/api/scripts/automation-setup.sh '${secret}'`,
  //   res
  // );

  const {pass, result} = generateToken(secret);

  res.status(pass ? 200 : 500).json({
    status: pass ? "pass" : "fail",
    result: result,
  });
  finishedStep(3);
}
