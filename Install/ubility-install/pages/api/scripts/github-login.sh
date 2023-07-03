mkdir Github
cd Github
mkdir .ssh
ssh-keygen -t rsa -q -N "" -f .ssh/id_rsa
pub_key=$(cat .ssh/id_rsa.pub)

cd ..
python3 ./add_key.py $GITHUB_TOKEN
cd Github
echo

read -p "Enter the github username of the account you'll be using with backstage: " GITHUB_USERNAME
export GITHUB_USERNAME=$GITHUB_USERNAME

PRIVATE_KEY=$(cat .ssh/id_rsa)
cd ..
clear