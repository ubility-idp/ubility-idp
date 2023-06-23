import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";

function notNonEmptyString(variable: any): boolean {
  if (typeof variable === "string" && variable.trim().length > 0) {
    return false;
  }
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);

  if (req.body === undefined)
    res.status(200).json({status: "fail", error: "No body sent"});

  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID,
    SUBSCRIPTION_ID,
  } = req.body;

  if (
    notNonEmptyString(AZURE_CLIENT_ID) &&
    notNonEmptyString(AZURE_CLIENT_SECRET) &&
    notNonEmptyString(AZURE_TENANT_ID) &&
    notNonEmptyString(SUBSCRIPTION_ID)
  ) {
    res.status(200).json({status: "fail", error: "Input data error"});
    return;
  }

  BashExec(
    `sh pages/api/scripts/azure-login.sh ${AZURE_CLIENT_ID} ${AZURE_CLIENT_SECRET} ${AZURE_TENANT_ID} ${SUBSCRIPTION_ID}`,
    res
  );
}
