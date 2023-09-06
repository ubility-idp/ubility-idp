import {StaticImageData} from "next/image";

import azure_login_step1 from "../assets/images/tutorials/azure_login/step1.png";
import azure_login_step2 from "../assets/images/tutorials/azure_login/step2.png";
import azure_login_step3 from "../assets/images/tutorials/azure_login/step3.png";
import azure_login_step3_2 from "../assets/images/tutorials/azure_login/step3-2.png";
import azure_login_step4 from "../assets/images/tutorials/azure_login/step4.png";
import azure_login_step5 from "../assets/images/tutorials/azure_login/step5.png";
import azure_login_step6 from "../assets/images/tutorials/azure_login/step6.png";
import azure_login_step7 from "../assets/images/tutorials/azure_login/step7.png";
import azure_login_step8 from "../assets/images/tutorials/azure_login/step8.png";
import azure_login_step9 from "../assets/images/tutorials/azure_login/step9.png";
import azure_login_step10 from "../assets/images/tutorials/azure_login/step10.png";
import azure_login_step10_2 from "../assets/images/tutorials/azure_login/step10-2.png";
import azure_login_step11 from "../assets/images/tutorials/azure_login/step11.png";

import github_setup_step1 from "../assets/images/tutorials/github_setup/step1.png";
import github_setup_step2 from "../assets/images/tutorials/github_setup/step2.png";

import github_oauth_step1 from "../assets/images/tutorials/github_oauth/step1.png";
import github_oauth_step2 from "../assets/images/tutorials/github_oauth/step2.png";
import github_oauth_step3 from "../assets/images/tutorials/github_oauth/step3.png";

import jenkins_setup_step1 from "../assets/images/tutorials/jenkins_setup/step1.png";
import jenkins_setup_step2 from "../assets/images/tutorials/jenkins_setup/step2.png";
import jenkins_setup_step3 from "../assets/images/tutorials/jenkins_setup/step3.png";
import jenkins_setup_step4 from "../assets/images/tutorials/jenkins_setup/step4.png";
import jenkins_setup_step5 from "../assets/images/tutorials/jenkins_setup/step5.png";
import jenkins_setup_step6 from "../assets/images/tutorials/jenkins_setup/step6.png";
import jenkins_setup_step7 from "../assets/images/tutorials/jenkins_setup/step7.png";
import jenkins_setup_step7_2 from "../assets/images/tutorials/jenkins_setup/step7-2.png";
import jenkins_setup_step8 from "../assets/images/tutorials/jenkins_setup/step8.png";

export type Input = {
  id: string;
  label: string;
  type: string;
  validation_regex?: RegExp;
  validation_error_message?: string;
};

export type TutStep = {
  nb: number;
  title: string;
  instructions: string[];
  image_visible: boolean;
  images: StaticImageData[];
  link?: {title: string; url: string};
  input_link?: string;
};

export type Step = {
  id: string;
  description: string;
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
    id: "jenkins_setup",
    description:
      "In this step, you will configure Jenkins on your machine. Follow up the below steps one by one and fill out at the end the Jenkins username and password.",
    nb: 0,
    label: "Jenkins Setup",
    api_endpoint: "jenkins-setup",
    inputs: [
      {id: "JENKINS_USERNAME", label: "Jenkins Username", type: "text"},
      {id: "JENKINS_API_TOKEN", label: "Jenkins API Token", type: "password"},
    ],
    tutorial: {
      visible: true,
      title: "",
      steps: [
        {
          nb: 0,
          title: "Open Jenkins",
          instructions: [
            "This is your jenkins admin password: <jenkins_admin_pass>",
            "Copy it and paste it into the adminstrator password field",
            "Then click 'Continue'",
          ],
          image_visible: true,
          images: [jenkins_setup_step1],
          link: {
            title: "http://<VM_ADDRESS>:8080",
            url: "http://<VM_ADDRESS>:8080",
          },
        },
        {
          nb: 1,
          title: "Install Jenkins Plugins",
          instructions: ["Click 'Install suggested plugins'"],
          image_visible: true,
          images: [jenkins_setup_step2],
        },
        {
          nb: 2,
          title: "Create Jenkins User",
          instructions: [
            "Fill with credentails to create a new jenkins user",
            "Enter the same username used here in the username input above",
          ],
          image_visible: true,
          images: [jenkins_setup_step3],
          input_link: "JENKINS_USERNAME",
        },
        {
          nb: 3,
          title: "Instance Configuration",
          instructions: ["Click 'Save and Finish'"],
          image_visible: true,
          images: [jenkins_setup_step4],
        },
        {
          nb: 4,
          title: "Jenkins is ready",
          instructions: ["Click 'Start using Jenkins'"],
          image_visible: true,
          images: [jenkins_setup_step5],
        },
        {
          nb: 5,
          title: "Open configuration page",
          instructions: [
            "Click on your username in the up-right corner",
            "Click on configure",
          ],
          image_visible: true,
          images: [jenkins_setup_step6],
        },
        {
          nb: 6,
          title: "Name the API token",
          instructions: [
            "In the API Token section, click 'Add new Token'",
            "Enter a clear name for Jenkins' api token",
            "Click 'Generate'",
          ],
          image_visible: true,
          images: [jenkins_setup_step7_2, jenkins_setup_step7],
        },
        {
          nb: 7,
          title: "Generate Jenkins' API Token",
          instructions: [
            "Select and copy the token",
            "Click 'Save' at the bottom of the Jenkins page",
            "Paste the token in the API token field at the top of this page",
          ],
          image_visible: true,
          images: [jenkins_setup_step8],
          input_link: "JENKINS_API_TOKEN",
        },
      ],
    },
  },
  {
    id: "azure_login",
    description:
      "In this step, you will create a new app registration on your azure subscription. You will then give this registration an owner role for it to be able to assign roles",
    nb: 1,
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
          title: "Open New App Registration page on Azure Portal",
          instructions: [
            "Give the app registration a clear name",
            "Click 'Register'",
          ],
          image_visible: true,
          images: [azure_login_step1],
          link: {
            title: "New App Registration Link",
            url: "https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false",
          },
        },
        {
          nb: 1,
          title: "Copy App Registration Identification",
          instructions: [
            "Copy the Application (client) ID and paste in the 'Client ID' input at the top of this page",
            "Copy the Directory (tenant) ID and paste in the 'Tenant ID' input at the top of this page",
          ],
          image_visible: true,
          images: [azure_login_step2],
        },
        {
          nb: 2,
          title: "Generate Secret",
          instructions: [
            "Click on the 'Certificates & secrets' section in the left menu”",
            "Click on 'New client secret'",
          ],
          image_visible: true,
          images: [azure_login_step3],
        },
        {
          nb: 3,
          title: "Copy Secret",
          instructions: [
            "Make sure to copy the secret in this step. You will not be able to copy it afterwards",
            "Paste the secret in the Client Secret input field above",
          ],
          image_visible: true,
          images: [azure_login_step4],
        },
        {
          nb: 4,
          title: "Open Subscription Page",
          instructions: [
            "Open the subscriptions page",
            "Choose the subscription you want to use",
            "Copy the subscription ID and paste it in the Subscription ID input field at the top of the page",
          ],
          image_visible: true,
          link: {
            title: "Azure Subscription Page",
            url: "https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade",
          },
          images: [azure_login_step5, azure_login_step6],
        },
        {
          nb: 5,
          title: "Assign the App Registration a New Role",
          instructions: [
            "Open the Access control (IAM) tab",
            "Click on 'Add'",
            "Finally click on 'Add role assignment",
          ],
          image_visible: true,
          images: [azure_login_step8],
        },
        {
          nb: 6,
          title: "Select Role",
          instructions: [
            "Open Privileged adminstrator roles",
            "Click on the 'Owner' role",
            "Click 'Next'",
          ],
          image_visible: true,
          images: [azure_login_step9],
        },
        {
          nb: 7,
          title: "Select the App Registration",
          instructions: [
            "Click on Select members",
            "Search for the app registration you just created",
            "Click 'Next'",
          ],
          image_visible: true,
          images: [azure_login_step10, azure_login_step10_2],
        },
        {
          nb: 7,
          title: "Finish Role Assignment",
          instructions: ["Click 'Review + assign'"],
          image_visible: true,
          images: [azure_login_step11],
        },
      ],
    },
  },
  {
    id: "terraform-vars",
    description:
      "This step creates a resource group on azure and an acr inside this resource group. Please provide the name of these resources to be created.",
    nb: 2,
    label: "Infrastructure",
    api_endpoint: "terraform-vars",
    inputs: [
      {
        id: "RESOURCE_GROUP",
        label: "Resource Group Name",
        type: "text",
        validation_regex: /^[-w._()]+$/,
        validation_error_message:
          "The input field must only contain alphanumeric characters (letters and digits), hyphens (-), underscores (_), periods (.), and parentheses (()). Please remove any unsupported characters and try again.",
      },
      {
        id: "CONTAINER_REGISTRY",
        label: "Container Registry Name",
        type: "text",
        validation_regex: /^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$/,
        validation_error_message:
          "The input field cannot contain consecutive hyphens (--) anywhere within, must consist solely of lowercase letters, digits, and hyphens (-), and the total length should fall within the range of 1 to 63 characters, inclusive.",
      },
    ],
    tutorial: {
      visible: false,
      title: "",
      steps: [],
    },
  },
  {
    id: "github_setup",
    description:
      "This step walks you through generating a new GitHub access token which will be used by backstage to read and write to your GitHub account. An ssh key will then be generated and registered with GitHub for Jenkins integration.",
    nb: 3,
    label: "Github Setup",
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
          images: [github_setup_step1],
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
          images: [github_setup_step2],
        },
      ],
    },
  },
  {
    id: "github_oauth",
    description:
      "This step walks you through registering OpenOps as a GitHub OAth application. An OAuth GitHub App is an application registered to use the GitHub API.",
    nb: 4,
    label: "Github OAuth",
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
            "Enter an appropriate name for the new OAuth application like OpenOps-OAuth",
            "Enter http://<VM_ADDRESS>:7007/ into the Homepage URL* field",
            "Enter http://<VM_ADDRESS>:7007/api/auth/github/handler/frame into the Authorization callback URL* field",
          ],
          image_visible: true,
          images: [github_oauth_step1],
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
          images: [github_oauth_step2],
          input_link: "GITHUB_CLIENT_ID",
        },
        {
          nb: 2,
          title: "Generate a new client secret",
          instructions: [
            "Click on 'Generate a new client secret'",
            "Copy the generated client secret and paste it in the installation guide",
          ],
          image_visible: true,
          images: [github_oauth_step3],
          input_link: "GITHUB_CLIENT_SECRET",
        },
      ],
    },
  },
  {
    id: "database-creds",
    description:
      "Please provide the username and password used to secure the PostgreSQL instance used by OpenOps.",
    nb: 5,
    label: "Database Credentials",
    api_endpoint: "database-creds",
    inputs: [
      {id: "POSTGRES_USER", label: "Postgres User", type: "text"},
      {id: "POSTGRES_PASSWORD", label: "Postgres Password", type: "password"},
    ],
    tutorial: {
      visible: false,
      title: "",
      steps: [],
    },
  },
  {
    id: "automation-setup",
    description:
      "Press 'Next' to start creating a secret and a JWT token to be used with Ubility's automation server.",
    nb: 6,
    label: "Automation Setup",
    api_endpoint: "automation-setup",
    inputs: [],
    tutorial: {
      visible: false,
      title: "",
      steps: [],
    },
  },
  {
    id: "adding-cred-to-jenkins",
    description:
      "Press 'Next' to add the Azure service principal and the GitHub ssh private key credentials to Jenkins.",
    nb: 7,
    label: "Adding Credentials to Jenkins",
    api_endpoint: "adding-cred-to-jenkins",
    inputs: [],
    tutorial: {
      visible: false,
      title: "",
      steps: [],
    },
  },
  {
    id: "docker-compose",
    description:
      "Press 'Finish' to start all OpenOps containers using the provided input variables.",
    nb: 8,
    label: "Starting the Docker Containers",
    api_endpoint: "docker-compose",
    inputs: [],
    tutorial: {
      visible: false,
      title: "",
      steps: [],
    },
  },
];

export default steps;
