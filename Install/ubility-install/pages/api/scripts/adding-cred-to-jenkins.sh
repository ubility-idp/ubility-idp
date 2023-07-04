export $(cat .ubility.env | xargs)

if [ -z "${AZURE_CLIENT_ID}" ] || [ -z "${AZURE_CLIENT_SECRET}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${GITHUB_USERNAME}" ] || [ -z "${PRIVATE_KEY}" ]; then
  echo "Error: env variable missing" 1>&2
  exit 1
fi

envsubst < pages/api/scripts/Jenkins/credential-github-ssh.xml > pages/api/scripts/Jenkins/credential-github-ssh.tmp.xml
envsubst < pages/api/scripts/Jenkins/credential-azure.xml > pages/api/scripts/Jenkins/credential-azure.tmp.xml

java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ < pages/api/scripts/Jenkins/credential-github-ssh.tmp.xml
java -jar jenkins-cli.jar -s http://$1:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ < pages/api/scripts/Jenkins/credential-azure.tmp.xml

rm pages/api/scripts/Jenkins/credential-github-ssh.tmp.xml pages/api/scripts/Jenkins/credential-azure.tmp.xml