export $(cat .ubility.env | xargs)

export PRIVATE_KEY="$(cat ubility_rsa)"
export DirectEntryPrivateKeySource='$DirectEntryPrivateKeySource'

cd ../../Jenkins

# if [ -z "${AZURE_CLIENT_ID}" ] || [ -z "${AZURE_CLIENT_SECRET}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${PRIVATE_KEY}" ]; then
#   echo "Error: env variable missing" 1>&2
#   exit 1
# fi

envsubst <credential-github-ssh.xml >credential-github-ssh.tmp.xml
envsubst <credential-azure.xml >credential-azure.tmp.xml

wget "http://$VM_ADDRESS:8080/jnlpJars/jenkins-cli.jar"
java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" install-plugin git-parameter:0.9.18
sleep 3
java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" safe-restart

sleep 15

java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ <credential-github-ssh.tmp.xml
java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ <credential-azure.tmp.xml

rm credential-github-ssh.tmp.xml credential-azure.tmp.xml
