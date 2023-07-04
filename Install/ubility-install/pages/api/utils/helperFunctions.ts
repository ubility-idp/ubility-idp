import * as fs from "fs";

export const addEnvVar = (key: string, value: string) => {
  const filePath = "./.ubility.env";
  const content = `${key}='${value}'\n`;

  try {
    fs.appendFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(
      "An error occurred while writing to ubility env file:",
      error
    );
    return false;
  }
};

export const finishedStep = (step_nb: number) => {
  const filePath = "./step.txt";
  const content = `${step_nb}`;

  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    return false;
  }
};

export const notNonEmptyString = (variable: any): boolean => {
  if (typeof variable === "string" && variable.trim().length > 0) {
    return false;
  }
  return true;
};
