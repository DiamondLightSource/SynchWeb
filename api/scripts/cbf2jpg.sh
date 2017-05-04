#!/bin/sh
source /etc/profile.d/modules.sh
module load mosflm

cd /tmp
find /tmp -mtime +3 -delete

export CCP4_SCR=/tmp

ipmosflm << eof
DETECTOR PILATUS
XGUI ON
DIRECTORY $1
TEMPLATE $2
IMAGE $3
GO
CREATE_IMAGE ZOOM -1 BINARY TRUE FILENAME $4
RETURN
EXIT
eof

rm fort.8
