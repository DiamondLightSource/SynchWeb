<?php foreach($labels as $i => $d): ?>

<br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

<div class="ca pad">
    <barcode code="<?php echo $d ?>" type="C39" size="1.8" height="2.5" />
    <div class="mono large">*<?php echo $d ?>*</div>
</div>

<pagebreak />

<?php endforeach; ?>
