#!/bin/sh

cd /tmp

export CCP4_MASTER=/dls_sw/apps/ccp4/x86_64/6.4.0/11oct2013/
export CINCL=$CCP4_MASTER/ccp4-6.4.0/include
export CLIBD=$CCP4_MASTER/ccp4-6.4.0/lib/data
export CCP4_SCR=/tmp
export root=$CCP4_MASTER/ccp4-6.4.0/bin

if [ $3 == 'dimple' ]; then
$root/fft HKLIN $1 MAPOUT "/tmp/$2_dimple_2fofc.map.tmp" << eof
title $2 2fofc
xyzlim asu
scale F1 1.0
labin -
F1=F SIG1=SIGF PHI=PH2FOFCWT W=FOM
end
eof

$root/mapmask MAPIN "/tmp/$2_dimple_2fofc.map.tmp" MAPOUT "/tmp/$2_dimple_2fofc.map" XYZIN "$4" << eof
BORDER 5
eof

$root/fft HKLIN $1 MAPOUT "/tmp/$2_dimple_fofc.map.tmp" << eof
title $2 fofc
xyzlim asu
scale F1 1.0
labin -
F1=F SIG1=SIGF PHI=PHFOFCWT W=FOM
end
eof


$root/mapmask MAPIN "/tmp/$2_dimple_fofc.map.tmp" MAPOUT "/tmp/$2_dimple_fofc.map" XYZIN "$4" << eof
BORDER 5
eof

gzip "/tmp/$2_dimple_2fofc.map"
gzip "/tmp/$2_dimple_fofc.map"


else
$root/fft HKLIN $1 MAPOUT "/tmp/$2_ep.map" << eof
title $2 fofc
xyzlim asu
scale F1 1.0
labin -
F1=F SIG1=SIGF PHI=PHI W=FOM
end
eof

#$mm MAPIN "/tmp/$2_ep.map.tmp" MAPOUT "/tmp/$2_ep.map" XYZIN "$4" << eof
#BORDER 5
#eof

gzip "/tmp/$2_ep.map"

fi