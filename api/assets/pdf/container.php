
    <?php foreach ($containers as $i => $c): ?>

        <htmlpageheader name="header1">
            <div class="header ca small">
            ISPyB2 Container Report - Proposal: <?php echo $c['PROP'] ?> Shipment: <?php echo $c['SHIPMENT'] ?>
            </div>
        </htmlpageheader>

        <sethtmlpageheader name="header1" value="on" show-this-page="1" />

        <htmlpagefooter name="footer1">
            <div class="header ca small">
                Page {PAGENO} of {nbpg}
            </div>
        </htmlpagefooter>

        <sethtmlpagefooter name="footer1" value="on" show-this-page="1" />


        <table class="border small pad">
            <tr>
                <th>Dewar</th>
                <td><?php echo $c['DEWAR'] ?></td>
            </tr>
            <tr>
                <th>Container</th>
                <td><?php echo $c['CONTAINER'] ?></td>
            </tr>
        </table>

        <table class="small border hund pad">
            <thead>
                <tr class="head">
                    <th>Location</th>
                    <th>Protein Acronym</th>
                    <th>Sample Name</th>
                    <th>Spacegroup</th>
                    <th>Barcode</th>
                    <th width="40%">Comments</th>
                </tr>
            </thead>

            <tbody>
            <?php foreach ($c['SAMPLES'] as $j => $s): ?>
                <tr>
                    <td><?php echo $s['LOCATION'] ?></td>
                    <td><?php echo $s['ACRONYM'] ?></td>
                    <td><?php echo $s['NAME'] ?></td>
                    <td><?php echo $s['SPACEGROUP'] ?></td>
                    <td><?php echo $s['CODE'] ?></td>
                    <td><?php echo $s['COMMENTS'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <?php if (sizeof($containers) > 1 && $i < sizeof($containers) - 1): ?>
        <pagebreak />
        <?php endif; ?>

    <?php endforeach; ?>
