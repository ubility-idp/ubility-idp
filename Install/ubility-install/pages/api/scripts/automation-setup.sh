export JWT_SECRET="$1"
jwt=$(pages/api/scripts/mk-jwt-token.sh)
echo 'AUTOMATION_SERVER_JWT='"'"${jwt}"'" >> .ubility.env
echo 'AUTOMATION_SECRET_KEY='"'"$1"'" >> .ubility.env