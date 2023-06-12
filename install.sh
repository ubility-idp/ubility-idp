#!/bin/sh
clear
echo '--------------- Preparing Virtual Machine ---------------'
echo
# apt
sudo apt update
sudo apt install -y software-properties-common gnupg2 curl jq

clear
echo '--------------- Installing Terraform ---------------'
echo
# install terraform
curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor >hashicorp.gpg
sudo install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
sudo apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt install -y terraform

clear
echo '--------------- Installing Docker ---------------'
echo
# install docker
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
 $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo chmod 666 /var/run/docker.sock


clear
echo '--------------- Installing Azure cli ---------------'
echo
# install azure cli
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

#_______________________________________________________________________________________________________
clear
echo '--------------- Jenkins Installation ---------------'
docker run -d \
  --privileged \
  --user root \
  -p 8080:8080 \
  -p 50000:50000 \
  --name jenkins-lts \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/local/bin/docker:/usr/local/bin/docker \
  jenkins/jenkins:lts
sleep 15

CONTAINER_REGISTRY="backstagedeployments"
RESOURCE_GROUP="BackstageDeployments"
RESOURCES_LOCATION="East Us"

cd Terraform
terraform init
terraform apply -var "resource_group_name=$RESOURCE_GROUP" -var "resource_group_location=$RESOURCES_LOCATION" -var "acr_name=$CONTAINER_REGISTRY" -auto-approve
cd ..

clear
echo '--------------- Jenkins Installation ---------------'
echo
read -p "Virtual machine ip address or domain name: " VM_ADDRESS
echo
echo This is your initial admin password:
docker exec jenkins-lts cat /var/jenkins_home/secrets/initialAdminPassword
echo
echo Head over to jenkins using this link: http://$VM_ADDRESS:8080 and use the password to login
echo
echo You need to open the 8080 port on the virtual machine to be able to access jenkins
echo
read -p 'Press enter when done' var
clear
echo '--------------- Jenkins Installation ---------------'

echo
echo Next install the suggested plugins and then create a new user
echo
read -p 'Press enter when done' var
clear
echo '--------------- Jenkins Installation ---------------'
echo
read -p "Jenkins Username (the username you just used to create the jenkins account): " JENKINS_USERNAME
clear
echo '--------------- Jenkins Installation ---------------'
echo
echo Head over to http://$VM_ADDRESS:8080/user/$JENKINS_USERNAME/configure and create a new api token
echo Copy the token and click save then paste it below
echo
read -p "Jenkins API token: " JENKINS_API_TOKEN

#_______________________________________________________________________________________________________
clear
echo '--------------- Azure Setup ---------------'
echo Login using your azure account
echo
read -p "Username: " AZURE_USERNAME
stty -echo
read -p "Password: " AZURE_PASSWORD
echo
stty echo
az login -u $AZURE_USERNAME -p $AZURE_PASSWORD
clear
echo '--------------- Azure Setup ---------------'
echo Registering the ubility-backstage app with azure
echo
echo Head over to https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade to get the subscription ID you want to use
echo
read -p "Enter the subscription ID: " SUBSCRIPTION_ID
az account set --subscription $SUBSCRIPTION_ID

AZURE_APP_ID=$(az ad app create --display-name 'ubility-backstage' | jq -r '.appId')
echo AZURE_APP_ID=$AZURE_APP_ID
echo Registering app with azure...
sleep 10
cred_res=$(az ad app credential reset --id $AZURE_APP_ID --append --only-show-errors)
AZURE_CLIENT_ID=$( echo $cred_res | jq -r '.appId')
AZURE_CLIENT_SECRET=$( echo $cred_res | jq -r '.password')
AZURE_TENANT_ID=$( echo $cred_res | jq -r '.tenant')

res=$(az ad app permission add --id $AZURE_APP_ID --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope  --only-show-errors)
sleep 3
res=$(az ad sp create --id $AZURE_APP_ID  --only-show-errors)
sleep 3
res=$(az role assignment create --assignee $AZURE_APP_ID --role Owner --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"  --only-show-errors)
sleep 3
res=$(az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" -t "$AZURE_TENANT_ID")
clear

#_______________________________________________________________________________________________________
echo '--------------- Github Setup ---------------'
echo
echo Github Token:
echo If you do not already have one head over to https://github.com/settings/tokens and generate a new token then copy it and paste it below
read -p "Github token: " GITHUB_TOKEN
clear
mkdir Github
cd Github
mkdir .ssh
ssh-keygen -t rsa -q -N "" -f .ssh/id_rsa
pub_key=$(cat .ssh/id_rsa.pub)

cd ..
python3 ./add_key.py $GITHUB_TOKEN
cd Github
echo

read -p "Enter the github username of the account you'll be using with backstage: " GITHUB_USERNAME
clear
echo '--------------- Github Setup ---------------'
echo
echo Next head over to http://$VM_ADDRESS:8080/manage/credentials/store/system/domain/_/newCredentials
echo Select SSH Username with private key
echo Set the id to: $GITHUB_USERNAME-githubssh
echo Give it a good description
echo Enter $GITHUB_USERNAME into the username field
echo Press 'Enter directly' under Private Key and paste the below private key in the browser:
echo
echo Leave Passphrase empty
cat .ssh/id_rsa
cd ..
echo
echo
read -p 'Press enter when done' var
clear

#_______________________________________________________________________________________________________
echo '--------------- Github OAuth app registration ---------------'
echo Head over to https://github.com/settings/applications/new
echo 'Give the application a name (ex. backstage-ubility)'
echo Homepage URL: http://$VM_ADDRESS:7007/
echo Authorization callback URL: http://$VM_ADDRESS:7007/api/auth/github/handler/frame
echo Press register application
echo
read -p 'Press enter when done' var
clear
echo '--------------- Github OAuth app registration ---------------'
echo
echo You can see Client ID in front of you copy it and paste it below
read -p "Client ID: " GITHUB_CLIENT_ID
clear
echo '--------------- Github OAuth app registration ---------------'
echo
echo Now generate a new client secret then copy it and paste it below
read -p "Client secret: " GITHUB_CLIENT_SECRET
clear


#_______________________________________________________________________________________________________
echo '--------------- Automation Server Setup ---------------'
echo
echo Generate JWT token
jwt_header=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | sed s/\+/-/g | sed 's/\//_/g' | sed -E s/=+$//)
read -p "A secret key to generate a JWT token: " secret

iat=$(date +%s)

payload=$(echo -n '{"id":"0","name":"ubility-backstage-user","role": "client","iat":creation_date}' | sed "s/creation_date/${iat}/g" | base64 | sed s/\+/-/g |sed 's/\//_/g' |  sed -E s/=+$//)

hexsecret=$(echo -n "$secret" | xxd -p | paste -sd "")
hmac_signature=$(echo -n "${jwt_header}.${payload}" |  openssl dgst -sha256 -mac HMAC -macopt hexkey:$hexsecret -binary | base64  | sed s/\+/-/g | sed 's/\//_/g' | sed -E s/=+$//)

jwt="${jwt_header}.${payload}.${hmac_signature}"

export AUTOMATION_SECRET_KEY=$secret
export AUTOMATION_SERVER_JWT="$jwt"
export AUTOMATION_SERVER_BASE_URL='http://automation:5000'

export CONTAINER_REGISTRY=$CONTAINER_REGISTRY
export RESOURCE_GROUP=$RESOURCE_GROUP

export SUBSCRIPTION_ID=$SUBSCRIPTION_ID
export AZURE_TENANT_ID=$AZURE_TENANT_ID
export AZURE_CLIENT_ID=$AZURE_CLIENT_ID
export AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET

export JENKINS_API_TOKEN=$JENKINS_API_TOKEN
export JENKINS_USERNAME=$JENKINS_USERNAME
export JENKINS_ADDRESS="http://$VM_ADDRESS:8080"

export GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
export GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
export GITHUB_TOKEN=$GITHUB_TOKEN
export POSTGRES_USER=pguser
export POSTGRES_PASSWORD=password
export POSTGRES_PORT=5432
export POSTGRES_HOST=postgres

export APP_BASE_URL="http://$VM_ADDRESS:3000"
export BACKEND_BASE_URL="http://$VM_ADDRESS:7007"
export ORIGIN="http://$VM_ADDRESS:3000"


echo '--------------- Starting the Containers ---------------'
echo
docker compose up -d
echo 'Congratulations your ubility backstage vm is now ready'
