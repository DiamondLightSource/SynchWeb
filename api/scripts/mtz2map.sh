#!/bin/sh

cd /tmp

source /etc/profile.d/modules.sh
module load ccp4

export CCP4_SCR=/tmp

if [ $3 == 'dimple' -o $3 == 'mrbump' ]; then

if [ $3 == 'dimple' ]; then
	# fofc2="F1=F SIG1=SIGF PHI=PH2FOFCWT W=FOM"
	# fofc="F1=F SIG1=SIGF PHI=PHFOFCWT W=FOM"
	# fofc2="F1=F SIG1=SIGF PHI=PHWT W=FOM"
	# fofc="F1=F SIG1=SIGF PHI=PHDELWT W=FOM"

	if mtzinfo $1 | grep -q PH2FOFCWT; then
		fofc2="F1=2FOFCWT SIG1=SIGF PHI=PH2FOFCWT"
		fofc="F1=F SIG1=SIGF PHI=PHFOFCWT W=FOM"
	else
		fofc2="F1=FWT SIG1=SIGF PHI=PHWT"
		fofc="F1=F SIG1=SIGF PHI=PHDELWT W=FOM"
	fi
else
	fofc2="F1=F SIG1=SIGF PHI=PHWT W=FOM"
	fofc="F1=F SIG1=SIGF PHI=PHDELWT W=FOM"
fi

# F SIGF FC PHIC FC_ALL PHIC_ALL FWT PHWT DELFWT PHDELWT FOM FC_ALL_LS PHIC_ALL_LS

fft HKLIN $1 MAPOUT "/tmp/$2_$3_2fofc.map.tmp" << eof
title $2 2fofc
xyzlim asu
scale F1 1.0
labin -
$fofc2
end
eof

mapmask MAPIN "/tmp/$2_$3_2fofc.map.tmp" MAPOUT "/tmp/$2_$3_2fofc.map" XYZIN "$4" << eof
BORDER 5
eof

fft HKLIN $1 MAPOUT "/tmp/$2_$3_fofc.map.tmp" << eof
title $2 fofc
xyzlim asu
scale F1 1.0
labin -
$fofc
end
eof


mapmask MAPIN "/tmp/$2_$3_fofc.map.tmp" MAPOUT "/tmp/$2_$3_fofc.map" XYZIN "$4" << eof
BORDER 5
eof

gzip "/tmp/$2_$3_2fofc.map"
gzip "/tmp/$2_$3_fofc.map"


else
fft HKLIN $1 MAPOUT "/tmp/$2_ep.map" << eof
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
