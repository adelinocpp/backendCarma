#!/bin/bash
npm run transpile
if [ -d "/var/www/backendCarma" ] ; then
    sudo rm -rf /var/www/backendCarma/*
    echo "Diretório de deploy limpo."
else
    sudo mkdir /var/www/backendCarma
    echo "Diretório de deploy criado!"
fi

sudo cp -rf node_modules /var/www/backendCarma/
sudo cp -rf dist /var/www/backendCarma/
sudo rm /var/log/carma_server_std_out.log
sudo rm /var/log/carma_server_error.log
sudo cp -f carma_server.service /etc/systemd/system/
sudo systemctl daemon-reload  
sudo systemctl enable carma_server.service
sudo systemctl restart carma_server.service
echo "---> Serviço Carma Backend implantado com sucesso!"
