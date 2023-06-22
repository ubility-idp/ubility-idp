export type Input = {
  id: string;
  label: string;
  type: string;
};

export type Step = {
  nb: number;
  label: string;
  api_endpoint: string;
  inputs: Input[];
};

const steps = [
  {
    nb: 0,
    label: "Azure Login",
    api_endpoint: "azure-login",
    inputs: [
      {id: "AZURE_USERNAME", label: "Azure Username", type: "text"},
      {id: "AZURE_PASSWORD", label: "Azure Password", type: "secret_text"},
      {id: "SUBSCRIPTION_ID", label: "Subscription ID", type: "text"},
    ],
  },
  {
    nb: 1,
    label: "Github Setup",
    api_endpoint: "github-setup",
    inputs: [
      {id: "GITHUB_USERNAME", label: "Github Username", type: "text"},
      {id: "GITHUB_TOKEN", label: "Github Token", type: "text"},
    ],
  },
];

export default steps;
