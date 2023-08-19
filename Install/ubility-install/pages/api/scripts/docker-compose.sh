cd ../../

export $(cat .ubility.env | xargs)

docker compose up -d
