const { exec } = require('child_process');

const executeShellCommand = (cmd: string) => {
  exec(cmd, (error: { message: any }, stdout: any, stderr: any) => {
    console.log(`__________Executing: ${cmd}___________`);
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log('__________________________________________');
  });
};

export default executeShellCommand;
