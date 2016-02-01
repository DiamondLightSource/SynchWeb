
        <htmlpageheader name="header1">
            <div class="header ca small">
            <?php echo $info['VISIT'] ?> on <?php echo $info['BEAMLINENAME'] ?> at <?php echo $info['ST'] ?>
            </div>
        </htmlpageheader>

        <sethtmlpageheader name="header1" value="on" show-this-page="1" />

        <htmlpagefooter name="footer1">
            <div class="header ca small">
                Page {PAGENO} of {nbpg}
            </div>
        </htmlpagefooter>

        <sethtmlpagefooter name="footer1" value="on" show-this-page="1" />

        <h1><?php echo $info['VISIT'] ?> Experimental Report</h1>

        <ul>
            <li>Beamline: <?php echo $info['BEAMLINENAME'] ?></li>
            <li>Started: <?php echo $info['ST'] ?></li>
            <li>Finished: <?php echo $info['EN'] ?></li>
            <li>Length: <?php echo $info['LEN'] ?> hours</li>
        </ul>

        <p>Registered Users</p>
        <ul>
            <?php foreach($users as $u): ?>
                <li><?php echo $u['FULLNAME'] ?></li>
            <?php endforeach; ?>
        </ul>

        <p>Local Contact</p>
        <ul>
            <li><?php echo $info['LC'] ?></li>
        </ul>

        <pagebreak />


        <h1>Data Collections</h1>
        <table class="small border hund">
            <thead>
                <tr class="head">
                    <th>Sample</th>
                    <!--<th>Image Prefix</th>-->
                    <th>Images</th>
                    <th>Res</th>
                    <th>&lambda;</th>
                    <th>&Omega; Osc</th>
                    <th>Spacegroup</th>
                    <th>Unit Cell</th>
                    <th>Processed Resolution</th>
                    <th>Rmeas</th>
                    <th>Completeness</th>
                    <th>Comments</th>
                </tr>
            </thead>

            <tbody>
            <?php foreach ($dcs as $i => $d): ?>
                <tr <?php echo $d['OVERLAP'] == 0 ? 'class="dc"' : '' ?>>
                    <td><?php echo $d['NAME'] ?></td>
                    <!--<td><?php echo $d['DIR'].$d['IMAGEPREFIX'].'_'.$d['DATACOLLECTIONNUMBER'] ?></td>-->
                    <td><?php echo $d['NUMBEROFIMAGES'] ?></td>
                    <td><?php echo number_format($d['RESOLUTION'],1) ?></td>
                    <td><?php echo number_format($d['WAVELENGTH'],4) ?></td>
                    <td><?php echo number_format($d['AXISRANGE'],2) ?></td>
                    <td><?php echo $d['SG'] ?></td>
                    <td><?php echo $d['CELL'] ?></td>
                    <td>
                        <?php if (sizeof($d['AP'])): ?>
                          <?php echo $d['AP'][0]['RLOW'] ?> - <?php echo $d['AP'][0]['RHIGH'] ?><br />
                          <?php echo $d['AP'][1]['RLOW'] ?> - <?php echo $d['AP'][1]['RHIGH'] ?><br />
                          <?php echo $d['AP'][2]['RLOW'] ?> - <?php echo $d['AP'][2]['RHIGH'] ?><br />
                        <?php endif; ?>
                    </td>
                    <td>
                        <?php if (sizeof($d['AP'])): ?>
                          <?php echo $d['AP'][0]['RMEAS'] ?><br />
                          <?php echo $d['AP'][1]['RMEAS'] ?><br />
                          <?php echo $d['AP'][2]['RMEAS'] ?><br />
                        <?php endif; ?>
                    </td>
                    <td>
                        <?php if (sizeof($d['AP'])): ?>
                          <?php echo $d['AP'][0]['COMPLETENESS'] ?><br />
                          <?php echo $d['AP'][1]['COMPLETENESS'] ?><br />
                          <?php echo $d['AP'][2]['COMPLETENESS'] ?><br />
                        <?php endif; ?>
                    </td>
                    <td><?php echo $d['COMMENTS'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>


        <pagebreak />

        <h1>Edge Scans</h1>

        <?php if (sizeof($ess)): ?>
        <table class="small border hund">
            <thead>
                <tr class="head">
                    <th>Sample</th>
                    <th>Exposure</th>
                    <th>Transmission</th>
                    <th>Element</th>
                    <th>E(peak)</th>
                    <th>f&rsquo;&rsquo; / f&rsquo;</th>
                    <th>E(inf)</th>
                    <th>f&rsquo;&rsquo; / f&rsquo;</th>
                    <th>Comments</th>
                </tr>
            </thead>

            <tbody>
            <?php foreach ($ess as $i => $d): ?>
                <tr>
                    <td><?php echo $d['NAME'] ?></td>
                    <td><?php echo number_format($d['EXPOSURETIME'],2) ?></td>
                    <td><?php echo number_format($d['TRANSMISSION'],1) ?></td>
                    <td><?php echo $d['ELEMENT'] ?></td>
                    <td><?php echo number_format($d['PEAKENERGY'],1) ?></td>
                    <td><?php echo $d['PEAKFDOUBLEPRIME'] ?> / <?php echo $d['PEAKFPRIME'] ?></td>
                    <td><?php echo number_format($d['INFLECTIONENERGY'],1) ?></td>
                    <td><?php echo $d['INFLECTIONFDOUBLEPRIME'] ?> / <?php echo $d['INFLECTIONFPRIME'] ?></td>
                    <td><?php echo $d['COMMENTS'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
        <p>No edge scans for this visit</p>
        <?php endif; ?>

        <pagebreak />

        <h1>Fluorescence Spectra</h1>

        <?php if (sizeof($fls)): ?>
        <table class="small border hund">
            <thead>
                <tr class="head">
                    <th>Sample</th>
                    <th>Energy</th>
                    <th>Transmission</th>
                    <th>Elements</th>
                    <th>Comments</th>
                </tr>
            </thead>

            <tbody>
            <?php foreach ($fls as $i => $d): ?>
                <tr>
                    <td><?php echo $d['NAME'] ?></td>
                    <td><?php echo number_format($d['ENERGY'],1) ?></td>
                    <td><?php echo number_format($d['TRANSMISSION'],1) ?></td>
                    <td><?php echo implode(', ', $d['ELEMENTS']) ?></td>
                    <td><?php echo $d['COMMENTS'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
        <p>No fluorescence spectra for this visit</p>
        <?php endif; ?>

