define(['backbone', 'utils/kvcollection'], function(Backbone, KVCollection) {

    var capillaries = [
        {
            name: "Borosilicate 1mm OD",
            short_name: "Boro_1mm",
            outer_diameter: 1.0,
            inner_diameter: 0.78,
            wall_thickness: 0.11,
            length: 40,
            sequence: "Si0.798B0.221Al0.023Na0.066K0.006O2",
            density: 2.23
        },
        {
            name: "Borosilicate 1.5mm OD",
            short_name: "Boro_1.5mm",
            outer_diameter: 1.5,
            inner_diameter: 1.17,
            wall_thickness: 0.165,
            length: 40,
            sequence: "Si0.798B0.221Al0.023Na0.066K0.006O2",
            density: 2.23
        },
        {
            name: "Borosilicate 2.0mm OD",
            short_name: "Boro_2.0mm",
            outer_diameter: 2.0,
            inner_diameter: 1.56,
            wall_thickness: 0.22,
            length: 40,
            sequence: "Si0.798B0.221Al0.023Na0.066K0.006O2",
            density: 2.23
        },
        {
            name: "Fused Silica 0.4mm OD",
            short_name: "SiO2_0.4mm",
            outer_diameter: 0.4,
            inner_diameter: 0.3,
            wall_thickness: 0.05,
            length: 50,
            sequence: "SiO2",
            density: 2.203
        },
        {
            name: "Fused Silica 1.0mm OD",
            short_name: "SiO2_1.0mm",
            outer_diameter: 1.0,
            inner_diameter: 0.8,
            wall_thickness: 0.1,
            length: 50,
            sequence: "SiO2",
            density: 2.203
        },
        {
            name: "Fused Silica 1.5mm OD",
            short_name: "SiO2_1.5mm",
            outer_diameter: 1.5,
            inner_diameter: 1.3,
            wall_thickness: 0.1,
            length: 50,
            sequence: "SiO2",
            density: 2.203
        },
        {
            name: "Fused Silica 2.5mm OD",
            short_name: "SiO2_2.5mm",
            outer_diameter: 2.5,
            inner_diameter: 2.3,
            wall_thickness: 0.1,
            length: 50,
            sequence: "SiO2",
            density: 2.203
        },
        {
            name: "Fused Silica 1/8\" OD",
            short_name: "SiO2_1/8\"",
            outer_diameter: 3.175,
            inner_diameter: 2.95,
            wall_thickness: 0.11,
            length: 60,
            sequence: "SiO2",
            density: 2.203
        },
        {
            name: "Fused Silica 1/16\" OD",
            short_name: "SiO2_1/16\"",
            outer_diameter: 1.59,
            inner_diameter: 1.39,
            wall_thickness: 0.11,
            length: 60,
            sequence: "SiO2",
            density: 2.203
        }
    ]

    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        capillaries: capillaries,
    }))
})