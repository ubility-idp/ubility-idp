export JWT_SECRET="$1"
jwt=$(pages/api/scripts/mk-jwt-token.sh)
# echo 'AUTOMATION_SERVER_JWT='"'"${jwt}"'" >> .ubility.env
# echo 'AUTOMATION_SECRET_KEY='"'"$1"'" >> .ubility.env

jq "'".AUTOMATION_SERVER_JWT=$jwt"'" env_vars.json
jq "'".AUTOMATION_SECRET_KEY=$1"'" env_vars.json

# printf '{"AUTOMATION_SERVER_JWT":"%s","AUTOMATION_SECRET_KEY":"%s"}\n' "${jwt}" "$1"

java -jar jenkins-cli.jar -s http://$VM_ADDRESS:8080/ -auth $JENKINS_USERNAME:"$JENKINS_API_TOKEN" create-credentials-by-xml system::system::jenkins _ <credential-github-ssh.xml
