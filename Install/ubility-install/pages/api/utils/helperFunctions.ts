import * as fs from "fs";
interface Idictionary {
  [key: string]: string;
}

export const addEnvVar = (key: string, value: string) => {
  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {}
  try {
    content[key] = value;

    fs.writeFileSync(filePath, JSON.stringify(content));
    return true;
  } catch (error) {
    console.log(
      "An error occurred while writing to ubility env json file:",
      error
    );
    return false;
  }
  // const filePath = "./.ubility.env";
  // const content = `${key}='${value}'\n`;

  // try {
  //   fs.appendFileSync(filePath, content);
  //   return true;
  // } catch (error) {
  //   console.error(
  //     "An error occurred while writing to ubility env json file:",
  //     error
  //   );
  //   return false;
  // }
};

export const finishedStep = (step_nb: number) => {
  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {}
  try {
    content[`step_${step_nb}`] = "yes";

    fs.writeFileSync(filePath, JSON.stringify(content));
    return true;
  } catch (error) {
    console.log(
      "An error occurred while writing to ubility env json file:",
      error
    );
    return false;
  }
};

export const unFinishStep = (step_nb: number) => {
  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {}
  try {
    content[`step_${step_nb}`] = "no";

    fs.writeFileSync(filePath, JSON.stringify(content));
    return true;
  } catch (error) {
    console.log(
      "An error occurred while writing to ubility env json file:",
      error
    );
    return false;
  }
};

export const checkStepStatus = (step_nb: number) => {
  const filePath = "./env_vars.json";
  let content: Idictionary = {};
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {}
  try {
    const status = content[`step_${step_nb}`];
    return status;
  } catch (error) {
    console.log(
      "An error occurred while writing to ubility env json file:",
      error
    );
    return false;
  }
};

export const notNonEmptyString = (variable: any): boolean => {
  if (typeof variable === "string" && variable.trim().length > 0) {
    return false;
  }
  return true;
};

interface EnvironmentObject {
  [key: string]: string;
}

function convertToJsonString(envObject: EnvironmentObject): string {
  let result = "";
  Object.keys(envObject).forEach((key) => {
    result += `${key}='${envObject[key]}'\n`;
  });
  return result;
}

function writeEnvToFile(content: string, filename: string): void {
  fs.writeFileSync(filename, content, {encoding: "utf-8"});
}

export const convertEnvJSONtoEnvFile = (envData: any) => {
  const envContent = convertToJsonString(envData);
  const envFilename = ".ubility.env";

  writeEnvToFile(envContent, envFilename);
};
