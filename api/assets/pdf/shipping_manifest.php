
<htmlpageheader name="header1">
    <div class="header ca small">
        <?php echo $facility ?> - Shipping Manifest <?php echo $period ?>    
    </div>
</htmlpageheader>

<sethtmlpageheader name="header1" value="on" show-this-page="1" />

<htmlpagefooter name="footer1">
    <div class="header ca small">
        Page {PAGENO} of {nbpg} | Created: <?php echo date('H:i:s d-m-Y') ?> 
    </div>
</htmlpagefooter>

<sethtmlpagefooter name="footer1" value="on" show-this-page="1" />

<table class="small border hund pad">
    <thead>
        <tr class="head">
            <th>Proposal / Shipment</th>
            <th>Dewars</th>
            <th>Created</th>
            <th>Shipped</th>
            <th>Account</th>
            <th>Flightcode</th>
            <th>Product</th>
            <th>Pieces</th>
            <th>Piece Barcode</th>
            <th>Weight (Kg)</th>
            <th>Sender</th>
            <th>Origin</th>
        </tr>
    </thead>

<?php foreach($shipments as $i => $s): ?>
    <tr>
        <td><?php echo $s['PROP'] ?><br /><?php echo $s['SHIPPINGNAME'] ?></td>
        <td><?php echo $s['DEWARS'] ?></td>
        <td><?php echo $s['DELIVERYAGENT_FLIGHTCODETIMESTAMP'] ?></td>
        <td><?php echo $s['DELIVERYAGENT_SHIPPINGDATE'] ?></td>
        <td><?php echo $s['TERMSACCEPTED'] ? $facility_account : $s['DELIVERYAGENT_AGENTCODE'] ?></td>
        <td><?php echo $s['DELIVERYAGENT_FLIGHTCODE'] ?></td>
        <td><?php echo $s['DELIVERYAGENT_PRODUCTCODE'] ?></td>
        <td><?php echo $s['DEWARCOUNT'] ?></td>
        <td><?php echo $s['DELIVERYAGENT_BARCODE'] ?></td>
        <td><?php echo $s['WEIGHT'] ?></td>
        <td><?php echo $s['GIVENNAME'] ?> <?php echo $s['FAMILYNAME'] ?><br /><?php echo $s['LABNAME'] ?></td>
        <td><?php echo $s['CITY'] ?>, <?php echo $s['POSTCODE'] ?>, <?php echo $s['COUNTRY'] ?></td>
    </tr>
<?php endforeach; ?>
</table>

<br />

<div>
    <div class="right thirty">
        <p>
        Total Shipments: <?php echo $totals['SHIPMENTS'] ?><br />
        Total Pieces: <?php echo $totals['PIECES'] ?><br />
        Total Weight: <?php echo $totals['WEIGHT'] ?> Kg
        </p>
    </div>

    <div class="left">
        <p>
            <?php echo $facility ?><br />
            <?php echo $facility_address ?>
        </p>
    </div>
</div>



<div>
    I/we agree and confirm that:
    <ol>
        <li>DHL Express Terms and Conditions of Carriage, a copy of which can be viewed on DHL Express' website (www.dhl.co.uk) or is available upon request, apply to all shipments and DHL Express' liability shall be limited in accordance with such Terms and Conditions and, where applicable, by the Montreal Convention, which may further limit DHL Express' liability.</li>
        <li>Unless I/we have expressly requested, been offered, and agreed to pay shipment insurance, either in writing or electronically via the insurance option in EasyShip, it will not be arranged for me/us by DHL Express.</li>
        <li>For the 'STARTDAY' and 'MIDDAY' Express products, I/we acknowledge that the Money Back Guarantee Terms and Conditions apply, a copy of which has been made available to me/us.</li>
        <li>This manifest has been provided to DHL Express in an electronic or diskette and a hardcopy format. In the event of a discrepancy between the number of shipments and/or pieces under a single air waybill label, form or equivalent document or label, which are recorded on this manifest, and the number of shipments and/or pieces actually recorded as received by DHL Express, DHL Express' records shall prevail. DHL Express shall have no responsibility for shipments and/or pieces not recorded as received by DHL Express.</li>
        <li>DHL Express reserves the right to impose fuel and other surcharges on shipments and I/we agree to pay such surcharges. I/we also agree to pay for all value added services requested by me/us. Details of the applicable fuel surcharges and other charges are available at www.dhl.com or from our local DHL Express Customer Service department.</li>
    </ol>
</div>

<div>
    <div class="right sixty">
        <p>
        Agreed By Courier (or Authorised Agent):  ________________<br />
        Date ___ / ____ / _______ Time: ______ (AM/PM)
        </p>
    </div>

    <div class="left thirty">
        <p>
        Agreed By Shipper: ________________<br />
        Date ___ / ____ / _______
        </p>
    </div>
</div>
