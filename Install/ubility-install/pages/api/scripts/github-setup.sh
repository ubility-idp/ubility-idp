docker cp ubility_rsa jenkins-lts:/root/.ssh/ubility_rsa
docker cp ubility_rsa.pub jenkins-lts:/root/.ssh/ubility_rsa.pub

docker exec jenkins-lts ssh-add chmod 700 /root/.ssh/ubility_rsa
docker exec jenkins-lts ssh-add chmod 744 root/.ssh/ubility_rsa.pub
docker exec jenkins-lts ssh-add /root/.ssh/ubility_rsa
