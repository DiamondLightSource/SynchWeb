#!/bin/bash
#
# This script is deprecated at DLS.
# It was required for other scripts that are now deprecated.
#
# CCP4

. /dls_sw/apps/ccp4/64/7.0/update35/ccp4-7.0/bin/ccp4.setup-sh

# XDS

export PATH=/dls_sw/apps/XDS/20170215/:${PATH}

# DIALS

. /dls_sw/apps/dials/dials-v1-5-1/build/setpaths.sh

