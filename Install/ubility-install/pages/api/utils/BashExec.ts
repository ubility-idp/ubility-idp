import {exec} from "child_process";
import {NextApiResponse} from "next";

const BashExec = (cmd: string, res: NextApiResponse) => {
  try {
    exec(cmd, (error, stdout, stderr) => {
      console.log({error, stdout, stderr});

      res.status(200).json({
        status: "pass",
        result: {error: error ? true : false, stdout, stderr},
      });
      return error ? true : false;
    });
  } catch (error) {
    res.status(200).json({
      status: "fail",
      error: `Error in child process: ${error}`,
    });
    return false;
  }
};

export default BashExec;
