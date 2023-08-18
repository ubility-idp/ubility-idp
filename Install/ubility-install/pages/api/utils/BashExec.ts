import {exec} from "child_process";
import {NextApiResponse} from "next";

type BAshExecReturn = {
  pass: boolean;
  result: {error: boolean; stdout: string; stderr: string};
};

const BashExec = async (
  cmd: string,
  res: NextApiResponse
): Promise<BAshExecReturn> => {
  return new Promise<BAshExecReturn>((resolve, reject) => {
    console.log("inside Bash but before cmd");
    try {
      exec(cmd, (error, stdout, stderr) => {
        console.log({error, stdout, stderr});
        resolve({
          pass: true,
          result: {error: error ? true : false, stdout: stdout, stderr: stderr},
        });
      });
      console.log("inside Bashand and inside cmd");
    } catch (error) {
      reject({
        pass: false,
        result: {error: true, stdout: "", stderr: error},
      });
    }
    console.log("inside Bashand but before cmd");
  });
};

export default BashExec;
