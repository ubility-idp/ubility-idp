export JWT_SECRET="$1"
jwt=$(pages/api/scripts/mk-jwt-token.sh)
echo 'jwt='"'"${jwt}"'" >> .ubility.env