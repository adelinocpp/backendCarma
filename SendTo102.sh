#!/bin/bash
npm run transpile
var=$(hostname -f) 
echo $var 
if [ "$var" == "spavff223" ] 
then
    sshpass -p "Acesso@99#Debian102" rsync -rt /media/CAEMLYN/40_Desenvolvimento/03_Difusao_SPAV/Orumila/backendCarma/dist --verbose adelino@10.45.25.102:/home/adelino/Orumila/backendCarma/
    sshpass -p "Acesso@99#Debian102" rsync -rt carma_server.service --verbose adelino@10.45.25.102:/home/adelino/Orumila/backendCarma/
else
    sshpass -p "Acesso@99#Debian102" rsync -rt /media/NUVEM/Orumila/backendCarma/dist --verbose adelino@10.45.25.102:/home/adelino/Orumila/backendCarma/
    sshpass -p "Acesso@99#Debian102" rsync -rt carma_server.service --verbose adelino@10.45.25.102:/home/adelino/Orumila/backendCarma/
fi