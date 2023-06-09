sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
sudo apt install ansible
pip3 install boto3
pip3 install Flask
pip3 install Flask-Cors  
pip3 install python-decouple  
pip3 install cryptography
python3 -m pip install --upgrade pip
pip3 install PyYAML
pip3 install paramiko
sudo apt install nginx
sudo nano /etc/nginx/sites-enabled/default
echo server{

        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        ssl_certificate /etc/letsencrypt/live/automation.ubilityai.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/automation.ubilityai.com/privkey.pem;
        root /home/ubility/server;
        index index.html index.htm index.nginx-debian.html;
        server_name Ubilityai automation.ubilityai.com;
	location /platform {
               proxy_pass http://127.0.0.1:5000;

 }

}

sudo systemctl start nginx.service