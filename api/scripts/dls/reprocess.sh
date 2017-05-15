#!/bin/bash

#export CINCL=/dls_sw/apps/ccp4/64/7.0/update35/ccp4-7.0/include
#export CCP4=/dls_sw/apps/ccp4/64/7.0/update35/ccp4-7.0
#export CLIBD=/dls_sw/apps/ccp4/64/7.0/update35/ccp4-7.0/lib/data

. /dls_sw/apps/mx-scripts/ispyb-reprocess/environ.sh

# Dials hotfix
export PYTHON_EGG_CACHE=/tmp/pythoneggcache
mkdir -p $PYTHON_EGG_CACHE

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -p|--pipeline)
    PIPELINE="$2"
    shift
    ;;
    -c|--unitcell)
    UNITCELL="unit_cell=$2"
    shift
    ;;
    -g|--spacegroup)
    SPACEGROUP="space_group=$2"
    shift
    ;;
    -r|--resolution)
    RESOLUTION="d_min=$2"
    shift
    ;;
    -i|--dcid)
    DCID="$2"
    shift
    ;;
    -d|--workingdir)
    CWD="$2"
    shift
    ;;
    *)
    
    ;;
esac
shift
done


# module load xia2

# Fix for plate data on i03
echo 'xds.colspot.minimum_pixels_per_spot=3' > spot.phil

xia2 failover=True pipeline=${PIPELINE} ${SPACEGROUP} ${UNITCELL} ${RESOLUTION} xinfo=xia.xinfo spot.phil
xia2.ispyb_xml ${CWD}/ispyb_reproc.xml
sed -e 's/xia2.txt/xia2.html/' -e 's/<Image><fileName>[^>]*>/<Image>/g' -e 's/<Image>/<Image><dataCollectionId>'"${DCID}"'<\/dataCollectionId>/' -e 's/<fileLocation>[^>]*>//g' ispyb_reproc.xml > ispyb_reproc2.xml


# FIXME I think this needs to use module load python/ana python yesno?
python /dls_sw/apps/mx-scripts/dbserver/src/DbserverClient.py -h sci-serv3 -p 1994 -i ${CWD}/ispyb_reproc2.xml

