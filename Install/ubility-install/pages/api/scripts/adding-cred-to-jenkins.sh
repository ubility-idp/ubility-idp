docker restart jenkins-lts

sleep 30

export $(cat .ubility.env | xargs)

export PRIVATE_KEY="'""$(cat ubility_rsa)""'"
export DirectEntryPrivateKeySource='$DirectEntryPrivateKeySource'

cd ../../Jenkins

# if [ -z "${AZURE_CLIENT_ID}" ] || [ -z "${AZURE_CLIENT_SECRET}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${PRIVATE_KEY}" ]; then
#   echo "Error: env variable missing" 1>&2
#   exit 1
# fi

envsubst <credential-github-ssh.xml >credential-github-ssh.tmp.xml
envsubst <credential-azure.xml >credential-azure.tmp.xml

java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ <credential-github-ssh.tmp.xml
java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ <credential-azure.tmp.xml

rm credential-github-ssh.tmp.xml credential-azure.tmp.xml
