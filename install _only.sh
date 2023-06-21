#!/bin/sh

CONTAINER_REGISTRY="backstagedeployments"
RESOURCE_GROUP="BackstageDeployments"
RESOURCES_LOCATION="East Us"

# clear
echo '--------------- Azure Login ---------------'
echo Login using the azure owner account
echo
read -p "Username: " AZURE_USERNAME
stty -echo
read -p "Password: " AZURE_PASSWORD
echo
stty echo
az login -u $AZURE_USERNAME -p $AZURE_PASSWORD

cd Terraform
terraform init
terraform apply -var "resource_group_name=$RESOURCE_GROUP" -var "resource_group_location=$RESOURCES_LOCATION" -var "acr_name=$CONTAINER_REGISTRY" -auto-approve
cd ..

# clear
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
# clear
echo '--------------- Jenkins Installation ---------------'
echo
echo Next install the suggested plugins and then create a new user
echo
read -p "Jenkins Username (the username you just used to create the jenkins account): " JENKINS_USERNAME
# clear
echo '--------------- Jenkins Installation ---------------'
echo
echo Head over to http://$VM_ADDRESS:8080/user/$JENKINS_USERNAME/configure and create a new api token
echo Copy the token and click save then paste it below
echo
read -p "Jenkins API token: " JENKINS_API_TOKEN

# install Jenkins
cd Jenkins
wget "http://$VM_ADDRESS:8080/jnlpJars/jenkins-cli.jar"
java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" install-plugin git-parameter:0.9.18
sleep 3
docker restart jenkins-lts
cd ..

#_______________________________________________________________________________________________________
# clear
echo '--------------- Azure Setup ---------------'
echo Registering the ubility-backstage app with azure
echo
echo Head over to https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade to get the subscription ID you want to use
echo
read -p "Enter the subscription ID: " SUBSCRIPTION_ID
az account set --subscription $SUBSCRIPTION_ID

cred_res=$(az ad sp create-for-rbac -n 'ubility-idp-sp' --role Owner --scopes /subscriptions/5942567f-8e9e-4747-a45f-c44f2f121646/resourceGroups/$RESOURCE_GROUP  --only-show-errors)
AZURE_CLIENT_ID=$( echo $cred_res | jq -r '.appId')
AZURE_CLIENT_SECRET=$( echo $cred_res | jq -r '.password')
AZURE_TENANT_ID=$( echo $cred_res | jq -r '.tenant')
sleep 3

res=$(az ad app permission add --id $AZURE_CLIENT_ID --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope  --only-show-errors)
sleep 10
res=$(az ad app permission grant --id $AZURE_CLIENT_ID --api 00000003-0000-0000-c000-000000000000 --scope /subscriptions/5942567f-8e9e-4747-a45f-c44f2f121646/resourceGroups/$RESOURCE_GROUP)
sleep 3
res=$(az login --service-principal --username="$AZURE_CLIENT_ID" --password="$AZURE_CLIENT_SECRET" --tenant="$AZURE_TENANT_ID")
# clear

#_______________________________________________________________________________________________________
echo '--------------- Github Setup ---------------'
echo
echo Github Token:
echo If you do not already have one head over to https://github.com/settings/tokens and generate a new token then copy it and paste it below
read -p "Github token: " GITHUB_TOKEN
# clear
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
export GITHUB_USERNAME=$GITHUB_USERNAME

PRIVATE_KEY=$(cat .ssh/id_rsa)
cd ..
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
# clear
echo '--------------- Github OAuth app registration ---------------'
echo
echo You can see Client ID in front of you copy it and paste it below
read -p "Client ID: " GITHUB_CLIENT_ID
# clear
echo '--------------- Github OAuth app registration ---------------'
echo
echo Now generate a new client secret then copy it and paste it below
read -p "Client secret: " GITHUB_CLIENT_SECRET
# clear


#_______________________________________________________________________________________________________
echo '--------------- Automation Server Setup ---------------'
echo
echo Generate JWT token
read -p "A secret key to generate a JWT token: " JWT_SECRET
export JWT_SECRET=$JWT_SECRET

cd Utils
sudo chmod 700 mk-jwt-token.sh
jwt=$(mk-jwt-token.sh)
cd ..

# exporting env vars 
export DirectEntryPrivateKeySource='$DirectEntryPrivateKeySource'

export VM_ADDRESS="$VM_ADDRESS"
export PRIVATE_KEY="$PRIVATE_KEY"

export AUTOMATION_SECRET_KEY="$JWT_SECRET"
export AUTOMATION_SERVER_JWT="$jwt"
export AUTOMATION_SERVER_BASE_URL='http://automation:5000'

export CONTAINER_REGISTRY="$CONTAINER_REGISTRY"
export RESOURCE_GROUP="$RESOURCE_GROUP"

export SUBSCRIPTION_ID="$SUBSCRIPTION_ID"
export AZURE_TENANT_ID="$AZURE_TENANT_ID"
export AZURE_CLIENT_ID="$AZURE_CLIENT_ID"
export AZURE_CLIENT_SECRET="$AZURE_CLIENT_SECRET"

export JENKINS_API_TOKEN="$JENKINS_API_TOKEN"
export JENKINS_USERNAME="$JENKINS_USERNAME"
export JENKINS_ADDRESS="http://$VM_ADDRESS:8080"

export GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID"
export GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET"
export GITHUB_TOKEN="$GITHUB_TOKEN"
export POSTGRES_USER="pguser"
export POSTGRES_PASSWORD="password"
export POSTGRES_PORT="5432"
export POSTGRES_HOST="postgres"

export APP_BASE_URL="http://$VM_ADDRESS:7007"
export BACKEND_BASE_URL="http://$VM_ADDRESS:7007"
export ORIGIN="http://$VM_ADDRESS:7007"

export AZURE_USERNAME=$AZURE_USERNAME
export AZURE_PASSWORD=$AZURE_PASSWORD

#_______________________________________________________________________________________________________
# clear
cd Jenkins
echo  '--------------- Adding credentials to jenkins ---------------'
envsubst < credential-github-ssh.xml > credential-github-ssh.tmp.xml
envsubst < credential-azure.xml > credential-azure.tmp.xml

java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ < credential-github-ssh.tmp.xml
java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ < credential-azure.tmp.xml

rm credential-github-ssh.tmp.xml credential-azure.tmp.xml
cd ..

# clear
echo '--------------- Starting the Containers ---------------'
echo
docker compose up -d
echo 'Congratulations your ubility backstage vm is now ready'
