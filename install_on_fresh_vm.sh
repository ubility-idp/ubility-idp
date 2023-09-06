#!/bin/sh
# clear
echo '--------------- Preparing Virtual Machine ---------------'
echo
# apt
apt update
apt install -y software-properties-common gnupg2 git curl jq

# clear
echo '--------------- Installing Terraform ---------------'
echo
# install terraform
curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor >hashicorp.gpg
install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
apt-add-repository --yes "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
apt install -y terraform

# clear
echo '--------------- Installing Docker ---------------'
echo
# install docker
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
 $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
chmod 666 /var/run/docker.sock

# clear
echo '--------------- Installing Azure cli ---------------'
echo
# install azure cli
curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# clear
echo '--------------- Installing Java ---------------'
echo
apt install openjdk-11-jre-headless -y

#_______________________________________________________________________________________________________
# clear
echo '--------------- Project Clone ---------------'
git clone https://github.com/ubility-idp/ubility-idp.git OpenOps
cd OpenOps

#_______________________________________________________________________________________________________
# clear
echo '--------------- Jenkins Installation ---------------'
cd Jenkins
docker compose up -d
cd ..
sleep 10

# Install needed dependencies on jenkins
docker exec "jenkins-lts" apt-get update -y
docker exec "jenkins-lts" apt-get install gettext -y
docker exec "jenkins-lts" curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
docker exec "jenkins-lts" install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
# Install az cli in jenkins container
# Option 1
# docker exec "jenkins-lts" curl -sL https://aka.ms/InstallAzureCLIDeb | bash
# Option 2
docker exec "jenkins-lts" apt-get update -y
docker exec "jenkins-lts" apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg
docker exec "jenkins-lts" mkdir -p /etc/apt/keyrings
docker exec "jenkins-lts" curl -sLS https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/keyrings/microsoft.gpg >/dev/null
docker exec "jenkins-lts" chmod go+r /etc/apt/keyrings/microsoft.gpg
docker exec "jenkins-lts" AZ_REPO=$(lsb_release -cs)
docker exec "jenkins-lts" echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | tee /etc/apt/sources.list.d/azure-cli.list
docker exec "jenkins-lts" apt-get update -y
docker exec "jenkins-lts" apt-get install -y azure-cli

docker exec "jenkins-lts" ssh -tt -o StrictHostKeyChecking=no github.com

#_______________________________________________________________________________________________________
# clear
echo '--------------- Installation Tool Dependencies ---------------'
apt update -y
apt install -y nodejs

cd Install/ubility-install
npm install
npm run build
npm start
