#!/bin/sh

cd /tmp

# If you are running with the module system, load ccp4
#. /etc/profile.d/modules.sh
#module load ccp4

# If not, define the environment variables required below
#export CCP4_MASTER=/dls_sw/apps/ccp4/<ccp4 version>
export CCP4_MASTER=/dls_sw/apps/ccp4/latest/ccp4-8.0
export CINCL=$CCP4_MASTER/include
export CLIBD=$CCP4_MASTER/lib/data

export CCP4_SCR=/tmp
export root=$CCP4_MASTER/bin

if [ -f $1 ]; then
	mtz=$1
else
	if [ -f $1.gz ]; then
		mtz=/tmp/$2_$3.mtz
		gunzip -c $1.gz > $mtz
	else
		echo "No mtz file found"
		exit
	fi
fi

if [ $3 == 'dimple' -o $3 == 'mrbump' ]; then

if [ -f $4 ]; then
	pdb=$4
else
	if [ -f $4.gz ]; then
		pdb=/tmp/$2_$3.pdb
		gunzip -c $4.gz > $pdb
	else
		echo "No pdb file found"
		exit
	fi
fi

if [ $3 == 'dimple' ]; then

	if $root/mtzinfo $mtz | grep -q PH2FOFCWT; then
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

$root/fft HKLIN $mtz MAPOUT "/tmp/$2_$3_2fofc.map.tmp" << eof
title $2 2fofc
xyzlim asu
scale F1 1.0
labin -
$fofc2
end
eof

$root/mapmask MAPIN "/tmp/$2_$3_2fofc.map.tmp" MAPOUT "/tmp/$2_$3_2fofc.map" XYZIN "$pdb" << eof
BORDER 5
eof

$root/fft HKLIN $mtz MAPOUT "/tmp/$2_$3_fofc.map.tmp" << eof
title $2 fofc
xyzlim asu
scale F1 1.0
labin -
$fofc
end
eof


$root/mapmask MAPIN "/tmp/$2_$3_fofc.map.tmp" MAPOUT "/tmp/$2_$3_fofc.map" XYZIN "$pdb" << eof
BORDER 5
eof

gzip "/tmp/$2_$3_2fofc.map"
gzip "/tmp/$2_$3_fofc.map"

rm -f /tmp/$2_$3.pdb

else
$root/fft HKLIN $mtz MAPOUT "/tmp/$2_$3.map" << eof
title $2 fofc
xyzlim asu
scale F1 1.0
labin -
F1=F SIG1=SIGF PHI=PHI W=FOM
end
eof

gzip "/tmp/$2_$3.map"

fi

rm -f /tmp/$2_$3.mtz
