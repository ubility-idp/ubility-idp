import {StaticImageData} from "next/image";

import azure_login_step1 from "../assets/images/tutorials/azure_login/step1.png";
import azure_login_step2 from "../assets/images/tutorials/azure_login/step2.png";

import github_setup_step1 from "../assets/images/tutorials/github_setup/step1.png";
import github_setup_step2 from "../assets/images/tutorials/github_setup/step2.png";

import github_oauth_step1 from "../assets/images/tutorials/github_oauth/step1.png";
import github_oauth_step2 from "../assets/images/tutorials/github_oauth/step2.png";
import github_oauth_step3 from "../assets/images/tutorials/github_oauth/step3.png";

export type Input = {
  id: string;
  label: string;
  type: string;
};

export type TutStep = {
  nb: number;
  title: string;
  instructions: string[];
  image_visible: boolean;
  image: StaticImageData;
  link?: {title: string; url: string};
};

export type Step = {
  id: string;
  nb: number;
  label: string;
  api_endpoint: string;
  inputs: Input[];
  tutorial?: {
    visible: boolean;
    title: string;
    steps: TutStep[];
  };
};

const steps: Step[] = [
  {
    id: "azure_login",
    nb: 0,
    label: "Azure Login",
    api_endpoint: "azure-login",
    inputs: [
      {id: "AZURE_CLIENT_ID", label: "Client ID", type: "text"},
      {id: "AZURE_CLIENT_SECRET", label: "Client Secret", type: "password"},
      {id: "AZURE_TENANT_ID", label: "Tenant ID", type: "text"},
      {id: "SUBSCRIPTION_ID", label: "Subscription ID", type: "text"},
    ],
    tutorial: {
      visible: true,
      title: "App Registration Step",
      steps: [
        {
          nb: 0,
          title: "Open Azure Portal",
          instructions: [
            "Search for 'app registrations'",
            "Click on App registrations",
          ],
          image_visible: true,
          image: azure_login_step1,
          link: {
            title: "https://portal.azure.com/#home",
            url: "https://portal.azure.com/#home",
          },
        },
        {
          nb: 1,
          title: "Create new app registration",
          instructions: ["Click New registration"],
          image_visible: true,
          image: azure_login_step2,
        },
      ],
    },
  },
  {
    id: "github_setup",
    nb: 1,
    label: "Github SSH Key",
    api_endpoint: "github-setup",
    inputs: [
      {id: "GITHUB_USERNAME", label: "Github Username", type: "text"},
      {id: "GITHUB_TOKEN", label: "Github Token", type: "password"},
    ],
    tutorial: {
      visible: true,
      title: "App Registration Step",
      steps: [
        {
          nb: 0,
          title: "Open github token page",
          instructions: [],
          image_visible: true,
          image: github_setup_step1,
          link: {
            title: "https://github.com/settings/tokens/new",
            url: "https://github.com/settings/tokens/new",
          },
        },
        {
          nb: 1,
          title: "Generate token",
          instructions: [],
          image_visible: true,
          image: github_setup_step2,
        },
      ],
    },
  },
  {
    id: "github_oauth",
    nb: 2,
    label: "Github Oauth",
    api_endpoint: "github-oauth",
    inputs: [
      {id: "GITHUB_CLIENT_ID", label: "Github Client Id", type: "text"},
      {id: "GITHUB_CLIENT_SECRET", label: "Github Secret", type: "password"},
    ],
    tutorial: {
      visible: true,
      title: "OAuth App Registration",
      steps: [
        {
          nb: 0,
          title: "Open the Register a new OAuth application page",
          instructions: [
            "Enter http://<VM_ADDRESS>:7007/ into the Homepage URL* field",
            "Enter http://<VM_ADDRESS>:7007/api/auth/github/handler/frame into the Authorization callback URL* field",
          ],
          image_visible: true,
          image: github_oauth_step1,
          link: {
            title: "https://github.com/settings/applications/new",
            url: "https://github.com/settings/applications/new",
          },
        },
        {
          nb: 1,
          title: "Copy Client ID",
          instructions: [
            "Copy the Client ID and paste it in the installation guide",
          ],
          image_visible: true,
          image: github_oauth_step2,
        },
        {
          nb: 2,
          title: "Generate a new client secret",
          instructions: [
            "Click on 'Generate a new client secret'",
            "Copy the generated client secret and paste it in the installation guide",
          ],
          image_visible: true,
          image: github_oauth_step3,
        },
      ],
    },
  },
];

export default steps;
