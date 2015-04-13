#!/bin/sh
#. /etc/profile.d/modules.sh
#module load ccp4
#module load mosflm

cd /tmp
find /tmp -mtime +3 -delete

export CCP4_MASTER=/dls_sw/apps/ccp4/x86_64/6.4.0/11oct2013/
export CINCL=$CCP4_MASTER/ccp4-6.4.0/include
export CLIBD=$CCP4_MASTER/ccp4-6.4.0/lib/data
export CCP4_SCR=/tmp

/dls_sw/apps/mosflm/7.0.9-13sep12/64/ipmosflm << eof
#ipmosflm << eof
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
