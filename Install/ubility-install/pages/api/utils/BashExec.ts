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
  return new Promise<BAshExecReturn>((resolve, reject) => {
    try {
      exec(cmd, (error, stdout, stderr) => {
        console.log({error, stdout, stderr});
        resolve({
          pass: error ? false : true,
          result: {stdout: stdout, stderr: stderr},
          error: "",
        });
      });
    } catch (error) {
      reject({
        pass: false,
        result: {stdout: "", stderr: ""},
        error: error as string,
      });
    }
  });
};

export default BashExec;
