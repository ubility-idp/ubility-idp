FROM ubuntu:20.04

RUN apt-get update
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/London
RUN apt install ca-certificates curl software-properties-common apt-utils gnupg gnupg2 gnupg1 -y
RUN apt install ansible python3-pip nginx ssh telnet wget git -y
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add - 
RUN curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor > hashicorp.gpg 

RUN install -o root -g root -m 644 hashicorp.gpg /etc/apt/trusted.gpg.d/
RUN apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
RUN apt install terraform iputils-ping  -y 

RUN apt install npm -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt install nodejs -y
RUN npm install pm2@latest -g

# pyenv
RUN apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y
RUN git clone https://github.com/pyenv/pyenv.git /app/pyenv
ENV PYENV_ROOT /app/pyenv
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH
RUN git clone https://github.com/pyenv/pyenv-virtualenv.git /app/pyenv/plugins/pyenv-virtualenv

# kubectl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin

# Installing prerequisite packages
RUN apt-get install -y tzdata keyboard-configuration
RUN apt-get -y install unzip groff less

# AWS CLI installation commands
RUN	curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN	unzip awscliv2.zip && ./aws/install

WORKDIR /app

#COPY . /usr/share/nginx/html/
COPY . .

RUN pip install -r requirements.txt

RUN pm2 start /app/app.py  --name automation --interpreter python3 
#COPY . /usr/share/nginx/html/ 
RUN echo "root:Ubility2022" | chpasswd
RUN useradd --no-create-home nginx
RUN echo "PermitRootLogin yes" >>/etc/ssh/sshd_config
#RUN service ssh restart
# RUN rm /etc/nginx/sites-enabled/default
RUN rm -r /root/.cache

# COPY default /etc/nginx/sites-enabled/
# RUN mv nginx.conf /etc/nginx/
RUN ln -s /usr/local/bin/python /usr/bin/python

RUN mkdir -p /app/scripts

RUN chmod +x /app/run.sh

RUN chmod +x /app/celery.sh

# AZ CLI installation commands
USER root
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# AZ Login
ARG AZURE_CLIENT_ID
ARG AZURE_CLIENT_SECRET
ARG AZURE_TENANT_ID
RUN az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET -t $AZURE_TENANT_ID
