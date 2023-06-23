import {StaticImageData} from "next/image";
import step1 from "../assets/images/tutorials/azure_login/step1.png";
import step2 from "../assets/images/tutorials/azure_login/step2.png";

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
          image: step1,
        },
        {
          nb: 1,
          title: "Create new app registration",
          instructions: ["Click on New registration"],
          image_visible: true,
          image: step2,
        },
        {
          nb: 2,
          title: "Kalamouniiiiiiiiii",
          instructions: ["Click on New registration"],
          image_visible: true,
          image: step2,
        },
      ],
    },
  },
  {
    id: "github_setup",
    nb: 1,
    label: "Github Setup",
    api_endpoint: "github-setup",
    inputs: [
      {id: "GITHUB_USERNAME", label: "Github Username", type: "text"},
      {id: "GITHUB_TOKEN", label: "Github Token", type: "text"},
    ],
    tutorial: {
      visible: true,
      title: "App Registration Step",
      steps: [
        {
          nb: 0,
          title: "Open AZure Portal",
          instructions: [""],
          image_visible: true,
          image: step1,
        },
      ],
    },
  },
  {
    id: "github_setup2",
    nb: 2,
    label: "Github Setup 2",
    api_endpoint: "github-setup2",
    inputs: [
      {id: "GITHUB_USERNAME", label: "Github Username", type: "text"},
      {id: "GITHUB_TOKEN", label: "Github Token", type: "text"},
    ],
    tutorial: {
      visible: true,
      title: "App Registration Step",
      steps: [
        {
          nb: 0,
          title: "Open AZure Portal",
          instructions: [""],
          image_visible: true,
          image: step1,
        },
      ],
    },
  },
];

export default steps;
