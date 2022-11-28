#!/bin/bash
sudo apt-get update
sudo apt-get -y install make

# install code deploy agent
sudo apt update -y
sudo apt install make g++ ruby ruby-full wget python3 python3-pip awscli pv -y
wget https://aws-codedeploy-ap-northeast-1.s3.ap-northeast-1.amazonaws.com/latest/install -O install-aws-codedeploy-agent
chmod +x ./install-aws-codedeploy-agent
sudo ./install-aws-codedeploy-agent auto > /tmp/logfile

# install docker
# https://docs.docker.com/engine/install/ubuntu/
sudo apt-get -y install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# enable to use docker without sudo
# https://docs.docker.com/engine/install/linux-postinstall/
sudo usermod -aG docker ubuntu
sudo systemctl restart docker

# install docker-compose
# https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04
sudo curl -L "https://github.com/docker/compose/releases/download/v2.6.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
