import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const host = req.headers.host?.split(":3000")[0];

  console.log(host);

  const {pass, result} = await BashExec(
    `sh pages/api/scripts/adding-cred-to-jenkins.sh '${host}'`,
    res
  );

  if (result.stderr != "") result.error = true;

  res.status(pass ? 200 : 500).json({
    status: pass ? "pass" : "fail",
    result: result,
  });
}
