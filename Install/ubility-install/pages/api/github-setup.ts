import {NextApiRequest, NextApiResponse} from "next";
import add_key_to_github from "./utils/add_key_to_github";
import {
  addEnvVar,
  finishedStep,
  notNonEmptyString,
} from "./utils/helperFunctions";

var keygen = require("ssh-keygen");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body === undefined)
    res.status(400).json({status: "fail", error: "No body sent"});

  const {GITHUB_USERNAME, GITHUB_TOKEN} = req.body;

  if (notNonEmptyString(GITHUB_USERNAME) && notNonEmptyString(GITHUB_TOKEN)) {
    res.status(400).json({status: "fail", error: "Input data error"});
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
        res.status(500).json({
          status: "fail",
          result: {error: true, stdout: "", stderr: err},
        });
        return console.error("Error in github ssh key generation: " + err);
      }
      console.log({err, GITHUB_TOKEN, pubkey: out.pubKey});

      const {pass, result} = await add_key_to_github(GITHUB_TOKEN, out.pubKey);

      console.log({pass, result});

      if (pass) {
        addEnvVar("GITHUB_USERNAME", GITHUB_USERNAME);
        addEnvVar("GITHUB_TOKEN", GITHUB_TOKEN);
        addEnvVar("PRIVATE_KEY", out.key);
      }

      res.status(pass ? 200 : 500).json({
        status: pass ? "pass" : "fail",
        result: {error: result},
      });
    }
  );

  // BashExec(
  //   `echo GITHUB_USERNAME=${GITHUB_USERNAME} GITHUB_TOKEN=${GITHUB_TOKEN}`,
  //   res
  // );
  finishedStep(1);
}
