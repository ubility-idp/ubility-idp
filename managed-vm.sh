#!/bin/sh
# clear
echo '--------------- Preparing Virtual Machine ---------------'
echo
# apt
sudo apt update
sudo apt install -y software-properties-common gnupg2 curl jq

# clear
echo '--------------- Installing Terraform ---------------'
echo
# install terraform
curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor >hashicorp.gpg
sudo install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
sudo apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt install -y terraform

# clear
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


# clear
echo '--------------- Installing Azure cli ---------------'
echo
# install azure cli
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# clear
echo '--------------- Installing Java ---------------'
echo
sudo apt install openjdk-11-jre-headless -y

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
docker exec "jenkins-lts" ssh -tt -o StrictHostKeyChecking=no github.com