import {NextApiRequest, NextApiResponse} from "next";
import BashExec from "./utils/BashExec";
import add_key_to_github from "./utils/add_key_to_github";
import {addEnvVar, finishedStep, notNonEmptyString} from "./utils/helperFunctions";

var keygen = require("ssh-keygen");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);

  if (req.body === undefined)
    res.status(200).json({status: "fail", error: "No body sent"});

  const {GITHUB_USERNAME, GITHUB_TOKEN} = req.body;

  if (notNonEmptyString(GITHUB_USERNAME) && notNonEmptyString(GITHUB_TOKEN)) {
    res.status(200).json({status: "fail", error: "Input data error"});
    return;
  }

  keygen(
    {
      location: ".ssh/ubility_rsa",
      comment: "ubility@idp.com",
      read: true,
    },
    async function (err: string, out: {key: string; pubKey: string}) {
      if (err) {
        res.status(200).json({
          status: "fail",
          result: {error: true, stdout: "", stderr: err},
        });
        return console.error("Error in github ssh key generation: " + err);
      }
      const pass = await add_key_to_github(GITHUB_TOKEN, out.pubKey);

      if (pass) {
        addEnvVar("GITHUB_USERNAME", GITHUB_USERNAME);
        addEnvVar("GITHUB_TOKEN", GITHUB_TOKEN);
      }

      res.status(200).json({
        status: pass ? "pass" : "fail",
        result: {error: !pass, stdout: "", stderr: err},
      });
    }
  );

  // BashExec(
  //   `echo GITHUB_USERNAME=${GITHUB_USERNAME} GITHUB_TOKEN=${GITHUB_TOKEN}`,
  //   res
  // );
  finishedStep(1);
}
