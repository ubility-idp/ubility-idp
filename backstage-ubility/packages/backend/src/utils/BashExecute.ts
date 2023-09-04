import { exec } from 'child_process';

type BAshExecReturn = {
  pass: boolean;
  result: { error: boolean; stdout: string; stderr: string };
};

const BashExec = async (cmd: string): Promise<BAshExecReturn> => {
  return new Promise<BAshExecReturn>((resolve, reject) => {
    try {
      exec(cmd, (error, stdout, stderr) => {
        console.log({ error, stdout, stderr });
        resolve({
          pass: true,
          result: {
            error: error ? true : false,
            stdout: stdout,
            stderr: stderr,
          },
        });
      });
    } catch (error) {
      reject({
        pass: false,
        result: { error: true, stdout: '', stderr: error },
      });
    }
  });
};

export default BashExec;
