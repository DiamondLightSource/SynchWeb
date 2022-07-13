#!/bin/bash
############################################################
# Name          : setup_synchweb_prod.bash
# Description   : Script to setup SynchWeb running in a podman container.  Note, the config.php file should be setup appropriately before running.
# Args          : $1 - name of podman image to create and run - default: 'synchweb-prod'
############################################################

imageName=synchweb-prod
if [ $1 ]
then
    imageName=$1
    echo Creating podman image with name: $imageName
fi

echo Building $imageName image...
podman build . -f Dockerfile --format docker -t $imageName --no-cache

echo Starting $imageName container
podman run -it -p 8082:8082 --mount type=bind,source=/dls,destination=/dls,bind-propagation=rslave $imageName
