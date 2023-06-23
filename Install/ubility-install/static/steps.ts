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
      {id: "AZURE_CLIENT_ID", label: "Client ID", type: "text"},
      {id: "AZURE_CLIENT_SECRET", label: "Client Secret", type: "secret_text"},
      {id: "AZURE_TENANT_ID", label: "Tenant ID", type: "text"},
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
