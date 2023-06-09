##script created by Janade Ahmad
#!/bin/bash
RED='\033[0;32m'
On_Yellow='\033[0;100m'
Color_Off='\033[0m'
purple='\033[1;95m'
red_warning='\033[1;91m'

echo "-----------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------"
echo -e "
${RED}${On_Yellow}ubility   ubility   ubility             ubility    ubility          ubility   ubilityubility  ubility   ubility  ${Color_Off}
${RED}${On_Yellow}ubility   ubility   ubility                        ubility                    ubilityubility   ubility  ubility  ${Color_Off}
${RED}${On_Yellow}ubility   ubility   ubilityubility      ubility    ubility          ubility       ubility       ubilityubility   ${Color_Off}
${RED}${On_Yellow}ubility   ubility   ubility  ubility    ubility    ubility          ubility       ubility          ubility       ${Color_Off}
${RED}${On_Yellow} ubility  ubility   ubility  ubility    ubility    ubility          ubility       ubility          ubility       ${Color_Off}
${RED}${On_Yellow}  ubilityubility    ubilityubility      ubility    ubilityubility   ubility       ubility          ubility       ${Color_Off}
${RED}${On_Yellow}     ubility        ubilityubility      ubility    ubilityubility   ubility       ubility          ubility       ${Color_Off}
     "
     
echo "-----------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------
"
##part of Domain URL 
URL_regex='^[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]\.[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]$'
read -p $'\e[36mplease enter your automation URL\e[0m: ' URL
if [ -z $URL ] || ! [[ $URL =~ $URL_regex ]]
 then
	 echo -e "[ERROR] You have entered invalid URL or nothing, Kindly enter the correct ${red_warning}URL${Color_Off} for Automation server or script will exit."
 	read -p  $'\e[36mPlease enter your automation URL again\e[0m: ' URL
		if [ -z $URL ]
 		then
		echo -e "${purple}Kindly rerun the script again to reconfigure it and install the Automation server.${Color_Off}"
	 	exit 1
		else 
			echo -e "[INFO] The entered URL is: ${RED}$URL${Color_Off}"
 		fi
 else 
	 echo -e "[INFO] The entered URL is: ${RED}$URL${Color_Off}"
 fi

##part of certification path 
read -p $'please enter the full path of certificate \e[36m.crt\e[0m of the URL which you have entered: ' crt
if [  ! -f "$crt" ] || [ -z "$crt" ]
 then
	 #IFS=
         echo -e "[ERROR] You have entered nothing or incorrect path, Kindly enter the correct path of the certificate ${red_warning}.crt${Color_Off} or script will exit."
	 read -p $'\e[36mPlease enter the full path of certificate again\e[0m: ' crt

	if [ ! -f "$crt" ] || [ -z $crt ] 
 	then
	 echo -e "${purple}Kindly rerun the script again to reconfigure it and install the Automation server.${Color_Off}"
         exit 1
        else 
         echo -e "[INFO] The path of certificate is: $crt"
 	fi
 else 
	 echo -e "[INFO] The path of certificate is: $crt"

 fi
##part of certification private key path
read -p $'Please enter the full path of certification private key  \e[36m*.key e.g:exampl.key\e[0m of the URL which you have entered: ' key
if [ ! -f "$key" ] || [ -z $key ]
 then
	 echo -e "[ERROR] You have entered nothing or incorrect path, Kindly enter the correct path of the certificate ${red_warning}.key${Color_Off} or script will exit."
        read -p $'\e[36mPlease enter the full path of certificate private key again\e[0m: ' key
        if [ -z $key ] || [ ! -f "$key" ]
        then
         echo -e "${purple}Kindly rerun the script again to reconfigure it and install the Automation server.${Color_Off}"
         exit 1
	else
 	  echo -e "[INFO] The path of certificate private key is: $key"
        fi
  else
     echo -e "[INFO] The path of certificate private key is: $key"
 fi

echo -e "${purple}[INFO] Here are the provided information:${Color_Off}"
echo -e "${RED}URL of Automation server:              $URL"
echo -e "The cetification path of the URL:      $crt"
echo -e "The certification private key for URL: $key${Color_Off}"
while true; do
    read -r -p "Do you wish to continue? (Y/N): " answer
    case $answer in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer Y or N.";;
    esac
done
echo "good"
#else 
#  case "$1" in
#        -help|--help|help|-h|--h)
#            echo "this is automation script"
#            ;;
#         [a-z].*.[a-z])
#            
#            echo "-help.--help.help,-h,--h for help"
#            ;;
#   esac
#fi

case "$1" in
        -help|--help|help|-h|--h)
            echo "Please run script as root user, once execute the script, it will prompt you to enter the required information."
            ;;
	 *)
            echo "-help,--help,help,-h,--h for help"
            ;;
esac
sudo apt-get update
sudo apt install curl software-properties-common apt-utils gnupg gnupg2 gnupg1 -y
sudo apt install ansible python3-pip nginx ssh telnet wget -y
sudo curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
sudo curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor > hashicorp.gpg
sudo install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
sudo apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt install terraform iputils-ping  -y
sudo pip3 install boto3
sudo pip3 install Flask Flask-Cors python-decouple cryptography
sudo python3 -m pip install --upgrade pip
sudo pip3 install PyYAML paramiko PyJWT uwsgi
sudo apt install npm -y
sudo curl -sL https://deb.nodesource.com/setup_14.x | bash -
sudo apt install nodejs -y
sudo npm install pm2@latest -g
sudo mkdir /app
cd /app
sudo pm2 start /app/app.py  --name automation --interpreter python3
sudo useradd --no-create-home nginx
sudo rm /etc/nginx/sites-enabled/default
sudo rm -r /root/.cache
sudo echo "server{
        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        ssl_certificate /etc/ssl/certs/ubility.crt;
        ssl_certificate_key /etc/ssl/private/ubility.key;
        root /app;
        index index.html index.htm index.nginx-debian.html;
        server_name automationtest.ubilityai.com;
        location /platform {
               proxy_pass http://127.0.0.1:5000;

 }

}
">/etc/nginx/sites-enabled/default

sudo mv "$crt" /etc/ssl/certs/
sudo mv "$key" /etc/ssl/private/
sudo service nginx start

####verfication 
for i in terraform ansible curl python3-pip nginx ssh telnet wget npm nodejs
do 
	dpkg -s $i >& /dev/null
	if [ "$?" -eq 0 ]; then echo -e "${RED}$i package is installed successfully${Color_Off}" 
	else echo -e "${red_warning}$i failed to install,try to install it manually${Color_Off}" ;fi 
done
