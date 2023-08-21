import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {pass, result} = await BashExec(
      "docker exec jenkins-lts cat /var/jenkins_home/secrets/initialAdminPassword",
      res
    );

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
