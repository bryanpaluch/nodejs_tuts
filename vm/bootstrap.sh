#!/usr/bin/env bash

#install nodejs and git
apt-get update
sudo apt-get install -y python-software-properties python g++ make git vim ctags
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs

#Install mysql
export DEBIAN_FRONTEND=noninteractive
apt-get -q -y install mysql-server
mysqladmin -u root password newmedia

#install .vim
su - vagrant
export HOME=/home/vagrant
cd ~
mkdir tmp
cd tmp
git clone https://github.com/bryanpaluch/.vim
cd .vim
make install

