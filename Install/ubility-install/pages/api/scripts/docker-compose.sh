cd ../../

export $(cat Install/ubility-install/.ubility.env | xargs)

docker compose up -d
