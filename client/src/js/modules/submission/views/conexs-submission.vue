<template>
    <div>
        <button name="orcaTabButton" class="button" v-on:click="tabDisplay($event)">ORCA</button>
        <button name="fdmnesTabButton" class="button" v-on:click="tabDisplay($event)">FDMNES</button>
        <button name="quantumEspressoTabButton" class="button" v-on:click="tabDisplay($event)">Quantum Espresso</button>
        <br />
        <section id="orcaTab" v-bind:style="{display: orcaDisplay}">
            <form v-on:submit.prevent="onSubmit" method="post" id="submit-orca" v-bind:class="{loading: isLoading}">
                <div class="form">
                    <ul>
                        <li>
                            <label class="left">Input file already exists (*.inp)?</label>
                            <input type="file" ref="inputFile" v-on:change="setInputFile($event)"/>
                            <button type="button" name="clearInputFile" class="button" v-on:click="clearFile($event)">Clear </button>
                        </li>
                        <li>
                            <label class="left">Element:</label>
                            <select name="element" v-model="element" v-on:change="showInfo($event); stringBuilder()">
                                <option v-for="e in elements">{{ e['element'] }}</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label class="notLeft">Absorption edge:</label>
                            <select name="absorbEdge" v-model="orca_edge" v-on:change="showInfo($event); stringBuilder()">
                                <option v-for="edge in orca_abs_edge">{{ edge }}</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label>Info:</label>
                            <span v-model="orca_element_info"></span>
                        </li>
                        <li>
                            <label class="left" >Which technique?</label>
                            <input type="radio" id="Xas" name="technique" value="Xas" checked="checked" v-model="technique" v-on:checked="stringBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="Xas">Xas</label>
                            &nbsp;&nbsp;&nbsp;
                            <input type="radio" id="Xes" name="technique" value="Xes" v-model="technique" v-on:checked="stringBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="Xes">Xes</label>
                        </li>
                        <li>
                            <label class="left">Functional:</label>
                            <select name="functional" v-model="functional" v-on:change="stringBuilder()">
                                <option>BLYP</option>
                                <option>B3LYP</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label class="notLeft">Basis:</label>
                            <select name="basis" v-model="basis" v-on:change="stringBuilder()">
                                <option>def2-SVP</option>
                                <option>def2-SV(P)</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Charge value:</label>
                            <input type="text" name="charge" v-model="charge" v-on:change="stringBuilder()" />
                            <label class="notLeft">Multiplicity value:</label>
                            <input type="text" name="multiplicity" v-model="multiplicity" v-on:change="stringBuilder()" />
                            <label class="notLeft" style="margin-right:5px">Solvent:</label>
                            <select name="solvent" v-model="solvent" v-on:change="stringBuilder()">
                                <option v-for="s in orca_solvents">{{ s['name'] }}</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Load structure (*xyz, *txt, *dat):</label>
                            <input type="file" ref="structureFile" v-on:change="stringBuilder($event)"/>
                            <button type="button" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                        </li>
                        <li>
                            <label class="left">Overview (cannot edit!):</label>
                            <textarea id="fileContents" v-bind:value="inputFileContents" v-bind:rows="textAreaRows" v-bind:cols="textAreaColumns" style="width:auto;height:auto" readonly>
                            </textarea>
                        </li>
                        <li>
                            <label class="left">Save input file:</label>
                            <button class="button" v-on:click="downloadFileContents()">Download</button>
                        </li>
                        <li>
                            <label class="left">CPUs (read only from Overview): </label>
                            <input type="text" name="memory" v-model="cpus" v-on:change="stringBuilder()"/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <label class="notLeft">Memory required in Gb:</label>
                            <input type="text" name="memory" v-model="memory" v-on:change="stringBuilder()"/>
                            <button type="submit" class="button submit" name="orcaSubmit">SUBMIT</button>
                        </li>
                        <li>
                            <button type="button" class="button" name="checkStatus" v-on:click="checkStatus()">CHECK STATUS</button>
                        </li>
                    </ul>
                </div>
            </form>
        </section>

        <section id="fdmnesTab" v-bind:style="{display: fdmnesDisplay}">
            <p>FDMNES stuff will be here somday</p>
        </section>

        <section id="quantumEspressoTab" v-bind:style="{display: quantumEspressoDisplay}">
            <p>Quantum Espresso stuff will be here somday, that's epic coffee right?</p>
        </section>
    </div>
</template>

<script>
    import Backbone from 'backbone'

    export default {
        name: 'ConexsSubmission',
        props: {

        },

        data: function(){
            return {
                inputFile: null,
                inputFileContents: '',
                textAreaRows: 25,
                textAreaColumns: 100,
                textAreaDisplay: 'inline',

                orcaDisplay: 'inline',
                elements: [
                    {'element': 'H', 'number': 1},
                    {'element': 'He', 'number': 2},
                    {'element': 'Li', 'number': 3},
                    {'element': 'Be', 'number': 4},
                    {'element': 'B', 'number': 5},
                    {'element': 'C', 'number': 6},
                    {'element': 'N', 'number': 7},
                    {'element': 'O', 'number': 8},
                    {'element': 'F', 'number': 9},
                    {'element': 'Ne', 'number': 10},
                    {'element': 'Na', 'number': 11},
                    {'element': 'Mg', 'number': 12},
                    {'element': 'Al', 'number': 13},
                    {'element': 'Si', 'number': 14},
                    {'element': 'P', 'number': 15},
                    {'element': 'S', 'number': 16},
                    {'element': 'Cl', 'number': 17},
                    {'element': 'Ar', 'number': 18},
                    {'element': 'K', 'number': 19},
                    {'element': 'Ca', 'number': 20},
                    {'element': 'Sc', 'number': 21},
                    {'element': 'Ti', 'number': 22},
                    {'element': 'V', 'number': 23},
                    {'element': 'Cr', 'number': 24},
                    {'element': 'Mn', 'number': 25},
                    {'element': 'Fe', 'number': 26},
                    {'element': 'Co', 'number': 27},
                    {'element': 'Ni', 'number': 28},
                    {'element': 'Cu', 'number': 29},
                    {'element': 'Zn', 'number': 30},
                    {'element': 'Ga', 'number': 31},
                    {'element': 'Ge', 'number': 32},
                    {'element': 'As', 'number': 33},
                    {'element': 'Se', 'number': 34},
                    {'element': 'Br', 'number': 35},
                    {'element': 'Kr', 'number': 36},
                    {'element': 'Rb', 'number': 37},
                    {'element': 'Sr', 'number': 38},
                    {'element': 'Y', 'number': 39},
                    {'element': 'Zr', 'number': 40},
                    {'element': 'Nb', 'number': 41},
                    {'element': 'Mo', 'number': 42},
                    {'element': 'Tc', 'number': 43},
                    {'element': 'Ru', 'number': 44},
                    {'element': 'Rh', 'number': 45},
                    {'element': 'Pd', 'number': 46},
                    {'element': 'Ag', 'number': 47},
                    {'element': 'Cd', 'number': 48},
                    {'element': 'In', 'number': 49},
                    {'element': 'Sn', 'number': 50},
                    {'element': 'Sb', 'number': 51},
                    {'element': 'Te', 'number': 52},
                    {'element': 'I', 'number': 53},
                    {'element': 'Xe', 'number': 54},
                    {'element': 'Cs', 'number': 55},
                    {'element': 'Ba', 'number': 56},
                    {'element': 'La', 'number': 57},
                    {'element': 'Ce', 'number': 58},
                    {'element': 'Pr', 'number': 59},
                    {'element': 'Nd', 'number': 60},
                    {'element': 'Pm', 'number': 61},
                    {'element': 'Sm', 'number': 62},
                    {'element': 'Eu', 'number': 63},
                    {'element': 'Gd', 'number': 64},
                    {'element': 'Tb', 'number': 65},
                    {'element': 'Dy', 'number': 66},
                    {'element': 'Ho', 'number': 67},
                    {'element': 'Er', 'number': 68},
                    {'element': 'Tm', 'number': 69},
                    {'element': 'Yb', 'number': 70},
                    {'element': 'Lu', 'number': 71},
                    {'element': 'Hf', 'number': 72},
                    {'element': 'Ta', 'number': 73},
                    {'element': 'W', 'number': 74},
                    {'element': 'Re', 'number': 75},
                    {'element': 'Os', 'number': 76},
                    {'element': 'Ir', 'number': 77},
                    {'element': 'Pt', 'number': 78},
                    {'element': 'Au', 'number': 79},
                    {'element': 'Hg', 'number': 80},
                    {'element': 'Tl', 'number': 81},
                    {'element': 'Pb', 'number': 82},
                    {'element': 'Bi', 'number': 83},
                    {'element': 'Po', 'number': 84},
                    {'element': 'At', 'number': 85},
                    {'element': 'Rn', 'number': 86},
                    {'element': 'Fr', 'number': 87},
                    {'element': 'Ra', 'number': 88},
                    {'element': 'Ac', 'number': 89},
                    {'element': 'Th', 'number': 90},
                    {'element': 'Pa', 'number': 91},
                    {'element': 'U', 'number': 92},
                    {'element': 'Np', 'number': 93},
                    {'element': 'Pu', 'number': 94},
                    {'element': 'Am', 'number': 95},
                    {'element': 'Cm', 'number': 96},
                    {'element': 'Bk', 'number': 97},
                    {'element': 'Cf', 'number': 98},
                ],
                orca_abs_edge: ['K',
                         'L1', 'L2', 'L3',
                         'M1', 'M2', 'M3', 'M4', 'M5',
                         'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7',
                         'O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7',
                ],
                element: '',
                orca_edge: '',
                orca_element_info: '',
                technique: '',
                functional: '',
                basis: '',
                charge: 0,
                multiplicity: 1,
                solvent: '',
                cpus: 4,
                memory: 16,
                orca_solvents: [
                         { name: 'None', value: [0,0] },
                         { name: 'Water', value: [80.4, 1.33] },
                         { name:'Acetone', value: [20.7, 1.359] },
                         { name:'Acetonitrile', value: [36.6, 1.344] },
                         { name: 'Ammonia', value: [22.4, 1.33] },
                         { name: 'Benzene', value: [2.28, 1.501] },
                         { name: 'CCl4', value: [2.24, 1.466] },
                         { name: 'CH2Cl2', value: [9.08, 1.424] },
                         { name: 'Chloroform', value: [4.9, 1.45] },
                         { name: 'Cyclohexane', value: [2.02, 1.425] },
                         { name: 'DMF', value: [38.3, 1.430] },
                         { name: 'DMSO',  value: [47.2, 1.479] },
                         { name: 'Ethanol', value: [24.3, 1.361] },
                         { name: 'Hexane', value: [1.89, 1.375] },
                         { name: 'Methanol', value: [32.63, 1.329] },
                         { name: 'Octanol', value: [10.3, 1.421] },
                         { name: 'Pyridine', value: [12.5, 1.510] },
                         { name: 'THF', value: [7.25, 1.407] },
                         { name: 'Toluene', value:[2.4, 1.497] }
                ],

                output: '',


                fdmnesDisplay: 'none',

                quantumEspressoDisplay: 'none',

            }
        },

        created: function(){
            this.element = this.elements[0]['element']
            this.orca_edge = this.orca_abs_edge[0]
            this.functional = 'BLYP'
            this.basis = 'def2-SVP'
            this.solvent = this.orca_solvents[0]['name']
            this.technique = 'Xas'
            this.stringBuilder()
        },

        methods: {
            tabDisplay: function(event){
                var name = event.target.name
                
                switch(name){
                    case "orcaTabButton":
                        this.orcaDisplay = 'inline'
                        this.fdmnesDisplay = 'none'
                        this.quantumEspressoDisplay = 'none'
                        break
                    case "fdmnesTabButton":
                        this.orcaDisplay = 'none'
                        this.fdmnesDisplay = 'inline'
                        this.quantumEspressoDisplay = 'none'
                        break
                    case "quantumEspressoTabButton":
                        this.orcaDisplay = 'none'
                        this.fdmnesDisplay = 'none'
                        this.quantumEspressoDisplay = 'inline'
                        break
                }
            },

            showInfo: function(event){
                // This will be a pain to implement since we don't have the xraydb library to calculate
                // everything we need. Will have to statically hold a bunch of json data or not bother
                // and leave it for the server side to figure out

                /*self.orca_element_info = 'Z=' + str(xraydb.atomic_number(self.orca_elements)) + ' '
                try:
                    _edge = self.orca_abs_edge
                    _element_info = xraydb.xray_edge(self.orca_elements, _edge)
                    self.orca_element_info += ', Energy= ' + str(_element_info.energy) + ' eV,' \
                                                                                        ' FYield= ' + str(_element_info.fyield)
                except:
                    pass
                let self = this

                var atomicNumber = this.elements.forEach(function(e, index){
                    if(e['element'] == self.element){
                        return e['number']
                    }
                })
                this.orca_element_info = 'Z=' + atomicNumber + ' Energy= ' + */
                console.log('showInfo Not currently implemented. If required we need a way to store/get all the xraydb data')
                app.alert({className: 'message notify', message: 'Show info not yet implemented. We will need to store a lot of xraydb data to do this.'})
            },

            // Build overview file/string based on form inputs or files uploaded
            // Will re-run on change of almost all form elements
            stringBuilder: function(event){
                if (this.technique == 'Xas') {
                    this.output = '! ' + this.functional + ' DKH2 ' + this.basis + ' def2/J '

                    if (this.solvent != 'None') {
                        this.output += 'CPCM(' + this.solvent + ') '
                    }

                    this.output += 'SlowConv' + "\n"
                    this.output += '! NoFinalGrid' + "\n"
                    this.output += '%maxcore 5024' + "\n\n"
                    this.output += '%pal nprocs ' + this.cpus + "\n"
                    this.output += 'end' + "\n\n"
                    this.output += '%tddft' + "\n"

                    var alpha_d0 = 0
                    var alpha_d1 = 0

                    if (this.orca_edge.includes('K')) {
                        alpha_d0 = 0
                        alpha_d1 = 0
                    } else if (this.orca_edge.includes('L')) {
                        alpha_d0 = 0
                        alpha_d1 = 3
                    }
                    this.output += 'orbWin[0] = ' + alpha_d0 + ',' + alpha_d1 + ',-1,-1' + "\n"
                    this.output += 'orbWin[1] = ' + alpha_d0 + ',' + alpha_d1 + ',-1,-1' + "\n"
                    this.output += 'doquad true' + "\n"
                    this.output += 'nroots 20' + "\n"
                    this.output += 'maxdim 10' + "\n"
                    this.output += 'end' + "\n\n"
                }
                else if (this.technique == 'Xes') {
                    this.output = '! UKS ' + this.functional + 'DKH2' + this.basis + ' def2/J '

                    if (this.solvent != 'None') {
                        this.output += 'CPCM(' + this.solvent + ') '
                    }
                    this.output += 'SlowConv' + "\n"
                    this.output += '! NoFinalGrid' + "\n\n"
                    this.output += '%maxcore 5024' + "\n\n"
                    this.output += '%pal nprocs ' + this.cpus + "\n"
                    this.output += 'end' + "\n\n"

                    this.output += '%xes' + "\n"
                    this.output += 'CoreOrb 0,1' + "\n"
                    this.output += 'OrbOp 0,1' + "\n"
                    this.output += 'DoSOC true' + "\n"
                    this.output += 'Normalize true' + "\n"
                    this.output += 'MDOriginAdjustMethod 1' + "\n"
                    this.output += 'end' + "\n\n"
                }

                if (this.solvent != 'None') {
                    this.output += '%cpcm' + "\n"

                    var solventArr = []

                    for(var i=0; i < this.orca_solvents.length; i++){
                        if(this.orca_solvents[i]['name'] == this.solvent){
                            solventArr = this.orca_solvents[i]['value']
                            break
                        }
                    }

                    this.output += 'epsilon ' + solventArr[0] + ' # Dielectric constant' + "\n"
                    this.output += 'refrac ' + solventArr[1] + ' # Refractive index' + "\n"
                    this.output += 'end' + "\n\n"
                }

                this.output += '*xyz ' + this.charge + ' ' + this.multiplicity + "\n"

                var ready = false
                let self = this

                var check = function(){
                    if(ready){
                        self.output += '*'
                        self.inputFileContents = self.output
                        self.output = ''
                        self.resizeOverview()
                    } else {
                        setTimeout(check, 1000)
                    }
                }
                check()

                if (event && event.target.files[0]) {
                    let reader = new FileReader()
                    reader.onload = function(e){
                        var rows = e.target.result.split("\n")
                        for(var i=0; i<rows.length; i++){
                            if(rows[i].trim() != '' && rows[i].trim()[0] != '#'){
                                self.output += rows[i] + "\n"
                            }
                        }
                        ready = true
                    }
                    reader.readAsText(event.target.files[0])
                } else {
                    ready = true
                }
            },

            // Resize text area to display the entire file without scrollbars
            resizeOverview: function(){
                var rows = this.inputFileContents.split("\n")
                var longestRow = 0

                for(var i=0; i<rows.length; i++){
                    if(rows[i].length > longestRow)
                        longestRow = rows[i].length
                }

                this.textAreaRows = rows.length
                this.textAreaColumns = longestRow
            },

            downloadFileContents: function() {
                // Create hidden <a> tag to get hyperlink for created Blob
                const a = document.createElement('a')
                a.href = URL.createObjectURL(
                    new Blob([this.inputFileContents], {type:"txt"})
                )
                a.setAttribute("download", "input.txt")
                document.body.appendChild(a);
                a.click()
                document.body.removeChild(a)
            },

            setInputFile: function(event, onLoadFileHandler){
                let self = this
                this.inputFile = event.target.files[0]

                let reader = new FileReader()
                reader.onload = function(e){
                    self.inputFileContents = e.target.result
                    self.resizeOverview()
                }
                reader.readAsText(this.inputFile)
            },

            clearFile: function(e){
                switch (e.target.name){
                    case 'clearInputFile':
                        this.$refs.inputFile.value = ''
                        break
                    case 'clearStructureFile':
                        this.$refs.structureFile.value = ''
                        break
                }
                this.stringBuilder()
            },

            onSubmit: function(e){
                e.preventDefault()
                let self = this

                if(this.inputFileContents != ''){
                    Backbone.ajax({
                        url: '',
                        data: {
                            data: self.inputFileContents,
                            charge: self.charge,
                            multiplicity: self.multiplicity,
                            memory: self.memory,
                        },
                        method: 'POST',

                        success: function(response) {
                            console.log('success!' + response)
                            app.alert({className: 'message notify', message: "Successfully submitted conexs file contents!"})
                            
                        },
                        error: function(response) {
                            app.alert({ title: 'Error', message: response })
                        },
                    })
                } else {
                    app.alert({ title: 'Error', message: 'No file provided, or the selected file is empty!'})
                }
            },

            checkStatus: function(){
                app.alert({className: 'message notify', message: 'Status check not yet implemented.'})
            }
        },
    }
</script>

<style scoped>
    /*label {
        font-size: 16px;
        margin-top: 4px;
        margin-right: 5px;
    }
    input[type="radio"] {
        margin-right: 5px;
    }
    div.form span.label, div.form label {
        width: 28%;
    }*/
    label.left {
        width: 9%;
        text-align: right;
    }
    label.notLeft {
        width: 5%;
        margin-left: 30px;
    }
    button {
        width: 150px;
        height: 30px;
    }
    input[type="text"] {
        width: 50px;
    }
</style>