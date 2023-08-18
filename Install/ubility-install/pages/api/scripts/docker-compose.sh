export $(cat .ubility.env | xargs)

cd ../../
docker compose up -d
