#!/bin/sh
# clear
echo
echo '--------------- Preparing Virtual Machine ---------------'
echo
# apt
apt update
apt install -y software-properties-common gnupg2 git curl jq

# clear
echo
echo '--------------- Installing Terraform ---------------'
echo
# install terraform
curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor >hashicorp.gpg
install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
apt-add-repository --yes "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
apt install -y terraform

# clear
echo
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
echo
echo '--------------- Installing Azure cli ---------------'
echo
# install azure cli
curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# clear
echo
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
echo
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
docker exec "jenkins-lts" curl -sL https://aka.ms/InstallAzureCLIDeb -o az_install.sh
docker exec "jenkins-lts" bash az_install.sh
docker exec "jenkins-lts" ssh -tt -o StrictHostKeyChecking=no github.com

#_______________________________________________________________________________________________________
# clear
echo
echo '--------------- Installation Tool Dependencies ---------------'
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=18
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install nodejs
# curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
# source ~/.profile
# nvm install 18

cd Install/ubility-install
npm install
npm install pm2 -g
npm run build
pm2 start npm --name "OpenOps Installation Wizard" -- start
