    <?php foreach($dewars as $i => $d): ?>

        <h1 class="ca">ISPyB Dewar Tracking</h1>

        <div class="border center eighty">
            <h2>LABEL INSTRUCTIONS</h2>
            <p>Please print the following three labels and use as follows:</p>
            <ol>
                <li><span class="bold">Dewar Label:</span> affix this label to your dewar which ensures it can be identified at all times at DLS</li>
                <li><span class="bold">Outbound Address label:</span> To be attached to the outside of your transport container for shipment to DLS</li>
                <li><span class="bold">Return Address Label:</span> The return address for your shipment (Please include this in your shipment, e.g. put it behind the outward bound address or in the transport container)</li>
            </ol>
        </div>


        <br />
        <br />
        <br />

        <p class="ca bold red">1. Dewar Tracking Label</p>
        <div class="border center eighty">
            <div class="ca">
                <img src="assets/images/dls_logo.jpg" width="250px" />
                <br />
                <br />

                <barcode code="<?php echo $d['BARCODE'] ?>" type="C39" size="0.75" height="1.5" />
                <div class="mono">*<?php echo $d['BARCODE'] ?>*</div>
            </div>

            <br />
            <br />

            <table class="center px500">
                <tr>
                    <td class="grey px150">Label</td>
                    <td><?php echo $d['CODE'] ?></td>
                </tr>
                <tr>
                    <td class="grey px150">Shipping Name</td>
                    <td><?php echo $ship['SHIPPINGNAME'] ?></td>
                </tr>
                <tr>
                    <td class="grey px150">Safety Level</td>
                    <td><?php echo $ship['SAFETYLEVEL'] ?></td>
                </tr>
                <tr>
                    <td class="grey px150">No. Parcels</td>
                    <td><?php echo sizeof($dewars) ?></td>
                </tr>
            </table>

            <table class="center px500">
                <tr>
                    <td class="grey px150">Proposal</td>
                    <td><?php echo $ship['PROP'] ?></td>
                </tr>
                <tr>
                    <td class="grey px150">Home Lab Name</td>
                    <td><?php echo $ship['LABNAME'] ?></td>
                </tr>
                <tr>
                    <td class="grey px150">Local Contact</td>
                    <td><?php echo $d['BEAMLINEOPERATOR'] ?></td>
                </tr>
            </table>
        </div>
        <pagebreak />


        <p class="ca bold red">2. Outgoing Address Label</p>
        <div class="border center">
            <div class="right thirty ca">
                <img src="assets/images/dls_logo.jpg" width="250px" />

                <br />
                <br />

                <p class="bold">Frozen samples in Dry-Shipper for experiments at DLS</p>
                <br />
                <p class="bold">Not restricted,<br />As per IATA special provision A152</p>

                <img src="assets/images/arrow.png"  width="250px" />

                <p class="bold">HANDLE WITH CARE</p>
                <p class="bold">DO NOT DROP</p>
            </div>

            <div class="ca pad">
                <barcode code="<?php echo $d['BARCODE'] ?>" type="C39" size="0.75" height="1.5" />
                <div class="mono">*<?php echo $d['BARCODE'] ?>*</div>
            </div>

            <div>
                <div class="left large bold" style="width: 70px">TO:</div>
                <div class="pad-left">
                    <p class="large bold"><?php echo $ship['FACILITYADDRESS'] ?></p>
                </div>
            </div>

            <div class="pad" style="padding-top: 0">
                <table style="width: 450px">
                    <tr>
                        <td class="grey px150">Parcel Label</td>
                        <td><?php echo $d['CODE'] ?></td>
                    </tr>
                    <tr><td colspan="2"></td></tr>
                    <tr>
                        <td class="grey px150">Shipment Name</td>
                        <td><?php echo $ship['SHIPPINGNAME'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Safety Level</td>
                        <td><?php echo $ship['SAFETYLEVEL'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">No. of Parcels</td>
                        <td><?php echo sizeof($dewars) ?></td>
                    </tr>
                    <tr><td colspan="2"></td></tr>
                    <tr>
                        <td class="grey px150">Proposal No.</td>
                        <td><?php echo $ship['PROP'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Beamline</td>
                        <td><?php echo $d['BEAMLINENAME'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Experiment Date</td>
                        <td><?php echo $d['ST'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Local Contact</td>
                        <td><?php echo $d['BEAMLINEOPERATOR'] ?></td>
                    </tr>
                </table>

                <div class="left" style="width: 70px">FROM:</div>
                <div class="pad-left grey">
                    <p>
                        <?php echo ucfirst($ship['GIVENNAME']) ?> <?php echo strtoupper($ship['FAMILYNAME']) ?><br />
                        <?php echo $ship['LABNAME'] ?><br />
                        <?php echo $ship['ADDRESS'] ?><br />
                        Tel: <?php echo $ship['PHONENUMBER'] ?><br />
                        Fax: <?php echo $ship['FAXNUMBER'] ?><br />
                    </p>

                </div>
            </div>
        </div>
        <pagebreak />


        <p class="ca bold red">3. Return Address Label</p>
        <div class="border center">
            <div class="right thirty ca">
                <img src="assets/images/dls_logo.jpg" width="250px" />

                <br />
                <br />

                <p class="bold">Frozen samples in Dry-Shipper for experiments at DLS</p>
                <br />
                <p class="bold">Not restricted,<br />As per IATA special provision A152</p>

                <img src="assets/images/arrow.png"  width="250px" />

                <p class="bold">HANDLE WITH CARE</p>
                <p class="bold">DO NOT DROP</p>
            </div>

            <div class="ca pad">
                <barcode code="<?php echo $d['BARCODE'] ?>" type="C39" size="0.75" height="1.5" />
                <div class="mono">*<?php echo $d['BARCODE'] ?>*</div>
            </div>

            <div>
                <div class="left large bold" style="width: 70px">TO:</div>
                <div class="pad-left">
                    <p class="large bold">
                        <?php echo ucfirst($ship['GIVENNAME2']) ?> <?php echo strtoupper($ship['FAMILYNAME2']) ?><br />
                        <?php echo $ship['LABNAME2'] ?><br />
                        <?php echo $ship['ADDRESS2'] ?><br />
                        <span class="normal">Tel: <?php echo $ship['PHONENUMBER2'] ?></span><br />
                        <span class="normal">Fax: <?php echo $ship['FAXNUMBER2'] ?></span><br />
                    </p>
                </div>
            </div>

            <div class="pad" style="padding-top: 0">
                <table style="width: 450px">
                    <tr>
                        <td class="grey px150">Parcel Label</td>
                        <td><?php echo $d['CODE'] ?></td>
                    </tr>
                    <tr><td colspan="2"></td></tr>
                    <tr>
                        <td class="grey px150">Shipment Name</td>
                        <td><?php echo $ship['SHIPPINGNAME'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Safety Level</td>
                        <td><?php echo $ship['SAFETYLEVEL'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">No. of Parcels</td>
                        <td><?php echo sizeof($dewars) ?></td>
                    </tr>
                    <tr><td colspan="2"></td></tr>
                    <tr>
                        <td class="grey px150">Proposal No.</td>
                        <td><?php echo $ship['PROP'] ?></td>
                    </tr>
                    <tr><td colspan="2"></td></tr>
                    <tr>
                        <td class="grey px150">Courier Name</td>
                        <td><?php echo $ship['DEFAULTCOURRIERCOMPANY'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Courier Acc. No.</td>
                        <td><?php echo $ship['COURIERACCOUNT'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Billing Reference</td>
                        <td><?php echo $ship['BILLINGREFERENCE'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Customs Value</td>
                        <td><?php echo $d['CUSTOMSVALUE'] ?></td>
                    </tr>
                    <tr>
                        <td class="grey px150">Transport Value</td>
                        <td><?php echo $d['TRANSPORTVALUE'] ?></td>
                    </tr>
                </table>

                <div class="left" style="width: 70px">FROM:</div>
                <div class="pad-left grey">
                    <p>
                        The Experimental Hall Coordinators<br />
                        Diamond Light Source Limited<br />
                        Chilton<br />
                        Didcot<br />
                        Oxfordshire<br />
                        OX11 0DE<br />
                        UNITED KINGDOM<br />
                        Tel: +44 (0)1235 778787<br />
                        Fax: +44 (0)1235 778499
                    </p>

                </div>
            </div>
        </div>

        <?php if (sizeof($dewars) > 1 && $i < sizeof($dewars) - 1): ?>
        <pagebreak />
        <?php endif; ?>


    <?php endforeach; ?>