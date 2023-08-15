import {exec} from "child_process";
import {NextApiResponse} from "next";

type BAshExecReturn = {
  pass: boolean;
  result: {stdout: string; stderr: string};
  error: string;
};

const BashExec = async (
  cmd: string,
  res: NextApiResponse
): Promise<BAshExecReturn> => {
  let pass = false;
  let err = "";
  let result = {stdout: "", stderr: ""};

  return new Promise<BAshExecReturn>((resolve, reject) => {
    try {
      exec(cmd, (error, stdout, stderr) => {
        console.log({error, stdout, stderr});

        pass = error ? false : true;
        result.stdout = stdout;
        result.stderr = stderr;
        err = "";
        resolve({
          pass: pass,
          result: result,
          error: err,
        });
      });
    } catch (error) {
      pass = false;
      result.stdout = "";
      result.stderr = "";
      err = error as string;
      reject({
        pass: pass,
        result: result,
        error: err,
      });
    }
  });
};

export default BashExec;
