The type of data collection is inferred through a number of different parameters.
`DataCollection.experimentType` is marked for removal, `DataCollectionGroup.experimentType` should be used instead.

# DataCollection

To populate a `DataCollection` first a `DataCollectionGroup` should be created, the following columns should be populated:

Column | Type | Description
--- | --- | ---
sessionid | int | A sessionid from `BLSession`
experimenttype | enum | OSC, Mesh, ...
blsampleid | int | A sampleid from `BLSample`

Then `DataCollection` can be populated, the following columns are required:


Column | Type | Description
--- | --- | ---
datacollectiongroupid | int | A datacollectiongroupid from `DataCollectionGroup`
starttime | datetime | The start time of the datacollection, should be populated as data collection starts to allow real time updates
endtime | datetime | The end time of the datacollection
runstatus | str | Popuplate as `Successful` on completion
imagedirectory | str | The directory where images / data are recorded
imageprefix | str | The prefix for images i.e. `filename_`, for filename_0001.cbf 
filetemplate | str | The template for the images / data. For a series of images this would be filename_####.cbf, for a hdf5 file the normal name can be used filename.h5
imagecontainersubpath | str | A path to the data if its a hdf5 file

For mx oscillation data

Column | Type | Description
--- | --- | ---
axisstart | float | Oscillation start in degrees
axisend | float | Oscillation end in degrees
axisrange | float | Oscillation range in degrees, 0.1deg
rotationaxis | str | The roation axis used: omega, phi, ...
overlap | float | Overlap for screening collection, -44.5 for 0, 45, 90 with oscillation of 0.5deg
numberofimages | int | Number of images collected
exposuretime | float | Exposure time in s
wavelength | float | Wavelength of beamline in angstrom
detectordistance | float | Detector distance in mm
resolution | float | Resolution at edge of detector in angstrom
transmission | float | Transmission in %, i.e. 10
xtalSnapshotFullPath1 | path | Path to a snapshot of the crystal at 0
xtalSnapshotFullPath2 | path | Path to a snapshot of the crystal at 90 (for gridscan with grid and results annotated)
xtalSnapshotFullPath3 | path | Path to a snapshot of the crystal at 180 (for gridscans with grid annotated)
phistart | float | For multi-axis goniomnetry, phi angle at start
kappastart | float | For multi-axis goniometry, kappa angle at start
omegastart | float | For multi-axis goniometry, omega angle at start
chistart | float | For multi-axis goniometry, chi angle at start
beamsizeatsamplex | float | Beamsize at the sample in microns in horizontal
beamsizeatsampley | float | Beamsize at the sample in microns in vertical
xbeam | float | Position of beam in horizontal
ybeam | float | Position of beam in vertical
detectorid | int | A detectorid from `Detector`


Multiple data collections can be stored in the same group, generally this applies to things like wedged SAD collections.


## Types

Data collections are classified using some fairly cryptic column combinations. These should be consolidated and simplified in the long term.

### Screening

A screening data collection is inferred from `DataCollection.overlap` > 0

### Grid Scans

`DataCollectionGroup.experimentType` should be populated as `Mesh`, although grid is actually inferred from:
```
DataCollection.numberOfImages > 1 && DataCollection.axisrange = 0
```
In the long term this should be consolidated to use `DataCollectionGroup.experimentType`

For gridscans the third crystal snapshot is used `DataCollection.xtalsnapshotfullpath3`. Interally this is because `xtalsnapshotfullpath1` is of the crystal, `xtalsnapshotfullpath2` has the grid with results annotated, and `xtalsnapshotfullpath3` has the grid alone. 

`GridImageMap` is unused and marked for removal.

The important parameters to populate are in `GridInfo`

Column | Type | Description
--- | --- | ---
datacollectiongroupid | int | A  `DataCollectionGroup` id (deprecated), use `DataCollection` instead
datacollectionid | int | A  `DataCollection` id
dx_mm | int | Step size in x in mm for each step in the grid. Not the total size of the grid.
dy_mm | int | Step size in y in mm for each step in the grid.
steps_x | int | Number of steps in x in the grid scan
steps_y | int | Number of steps in y in the grid scan
snapshot_offsetxpixel | int | Number of pixels from top left of the snapshot image in x to where the top left of the grid starts
snapshot_offsetypixel | int | Number of pixels from top left of the snapshot image in y to where the top left of the grid starts
pixelspermicronx | float | Confusingly, microns per pixel. Physical size of the pixel in x in microns
pixelspermicrony | float | Confusingly, microns per pixel. Physical size of the pixel in y in microns

This allows the snapshot to be cropped to the correct location and the grid to be navigatable by click to show an resulting diffraction image. The results from Per Image Analysis are then merged on top as a heatmap.

### Oscillation Data Collection

Data collection is assumed when `DataCollection.axisrange` > 0 and `DataCollection.overlap` = 0


# Detector

`Detector` can be populated, this will allow the diffraction image viewer to correctly calculate resolution limits, etc.

Column | Type | Description
--- | --- | ---
detectortype | str | Type of detector, integrating, photon counter, ...
detectormanufacturer | str | Detector manufacturer
detectormodel | str | Detector model
detectorpixelsizehorizontal | float | Size of pixels in microns in horizontal
detectorpixelsizevertical | float | Size of pixels in microns in vertical
detectorserialnumber | str | Serial number of detector
numberofpixelsx | int | Number of pixels in x
numberofpixelsy | int | Number of pixels in y


# Per Image Analysis

Per image analysis is populated into `ImageQualityIndicators`. The is calculated for a selection of 250 images during normal data collection and for every image for GridScans

Both `datacollectionid` and `imagenumber` should be populated, along with the following:

Column | Type | Description
--- | --- | ---
method2res | float | Maximium resolution detected
spottotal | int | Number of spots found
totalintegratedsignal | int | Total integrated signal for the image
goodbraggcandidates | int | Number of spots considered good bragg candidates

For EM `driftfactor` (float) can be populated for each movie
