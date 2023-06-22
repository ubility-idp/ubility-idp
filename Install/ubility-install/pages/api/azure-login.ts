import {exec} from "child_process";
import {NextApiRequest, NextApiResponse} from "next";

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

  const {AZURE_USERNAME, AZURE_PASSWORD, SUBSCRIPTION_ID} = req.body;

  if (
    notNonEmptyString(AZURE_USERNAME) &&
    notNonEmptyString(AZURE_PASSWORD) &&
    notNonEmptyString(SUBSCRIPTION_ID)
  ) {
    res.status(200).json({status: "fail", error: "Input data error"});
    return;
  }

  exec(
    `echo AZURE_USERNAME=${AZURE_USERNAME} AZURE_PASSWORD=${AZURE_PASSWORD} SUBSCRIPTION_ID=${SUBSCRIPTION_ID}`,
    (error, stdout, stderr) => {
      console.log({error, stdout, stderr});

      res.status(200).json({
        status: "pass",
        result: {error: error ? true : false, stdout, stderr},
      });
    }
  );
}
