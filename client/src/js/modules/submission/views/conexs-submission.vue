<template>
    <div>
        <button name="orcaTabButton" class="button" v-on:click="tabDisplay($event)">ORCA</button>
        <button name="fdmnesTabButton" class="button" v-on:click="tabDisplay($event)">FDMNES</button>
        <button name="quantumEspressoTabButton" class="button" v-on:click="tabDisplay($event)">Quantum Espresso</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span>Cluster status: {{ clusterStatus }}</span>&nbsp;&nbsp;&nbsp;<i v-if="clusterStatus != 'Running' && clusterStatus != 'Sleeping' && clusterStatus != 'Unavailable'" class="fa icon grey fa-cog fa-spin"></i>
        <br />

        <form v-on:submit.prevent="onSubmit" method="post" id="submit-orca" v-bind:class="{loading: isLoading}">

            <br />
            <label class="left">Input file already exists (*.inp)?</label>
            <input type="file" ref="inputFile" v-on:change="setInputFile($event)"/>
            <button type="button" ref="clearInputFile" name="clearInputFile" class="button" v-on:click="clearFile($event)">Clear </button>

            <section id="orcaTab" v-bind:style="{display: orcaDisplay}">
                <!--<div class="form">-->
                    <ul>
                        <li>
                            <label class="left">Element:</label>
                            <select name="element" v-model="element" v-on:change="showInfo($event); overviewBuilder()">
                                <option v-for="e in elements">{{ e['element'] }}</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label class="notLeft">Absorption edge:</label>
                            <select name="absorbEdge" v-model="orca_edge" v-on:change="showInfo($event); overviewBuilder()">
                                <option v-for="edge in orca_abs_edge">{{ edge }}</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label>Info:</label>
                            <span v-model="orca_element_info"></span>
                        </li>
                        <li>
                            <label class="left" >Which technique?</label>
                            <input type="radio" id="Xas" name="technique" value="Xas" checked="checked" v-model="technique" v-on:change="overviewBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="Xas">Xas</label>
                            &nbsp;&nbsp;&nbsp;
                            <input type="radio" id="Xes" name="technique" value="Xes" v-model="technique" v-on:change="overviewBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="Xes">Xes</label>
                        </li>
                        <li>
                            <label class="left">Functional:</label>
                            <select name="functional" v-model="functional" v-on:change="overviewBuilder()">
                                <option>BLYP</option>
                                <option>B3LYP</option>
                            </select>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                            <label class="notLeft">Basis:</label>
                            <select name="basis" v-model="basis" v-on:change="overviewBuilder()">
                                <option>def2-SVP</option>
                                <option>def2-SV(P)</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Charge value:</label>
                            <input type="text" name="charge" v-model="charge" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('charge')}" v-validate="'required|decimal'" />
                            <label class="notLeft">Multiplicity value:</label>
                            <input type="text" name="multiplicity" v-model="multiplicity" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('multiplicity')}" v-validate="'required|decimal'" />
                            <label class="notLeft" style="margin-right:5px">Solvent:</label>
                            <select name="solvent" v-model="solvent" v-on:change="overviewBuilder()">
                                <option v-for="s in orca_solvents">{{ s['name'] }}</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Load structure (*xyz, *txt, *dat):</label>
                            <input type="file" ref="orcaStructureFile" v-on:change="overviewBuilder($event)"/>
                            <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                        </li>
                    </ul>
                <!--</div>-->
            </section>

            <section id="fdmnesTab" v-bind:style="{display: fdmnesDisplay}">
                <ul>
                    <li>
                        <label class="left">Result filename (no extension) </label>
                        <input type="text" name="fdemnes_result_file" v-model="fdmnes_result_file" v-on:change="overviewBuilder()">
                    </li>

                    <li>
                        <label class="left">Element:</label>
                        <select name="element" v-model="element" v-on:change="showInfo($event); overviewBuilder()">
                            <option v-for="e in elements">{{ e['element'] }}</option>
                        </select>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                        <label class="notLeft">Absorption edge:</label>
                        <select name="absorbEdge" v-model="fdmnes_edge" v-on:change="showInfo($event); overviewBuilder()">
                            <option v-for="edge in fdmnes_abs_edge">{{ edge }}</option>
                        </select>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                        <label>Info:</label>
                        <span v-model="orca_element_info"></span>
                    </li>

                    <li>
                        <label class="left">Method:</label>
                        <select name="method" v-model="fdmnes_method" v-on:change="overviewBuilder()">
                            <option>Green</option>
                            <option>FDM</option>
                        </select>

                        <label class="notLeft">Crystal?</label>
                        <select name="crystal" v-model="crystal" v-on:change="overviewBuilder()">
                            <option>Crystal</option>
                            <option>Molecule</option>
                        </select>
                    </li>
                    <li>
                        <label class="left">Load structure (*xyz, *txt, *dat):</label>
                        <input type="file" ref="fdmnesStructureFile" v-on:change="overviewBuilder($event)"/>
                        <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                    </li>
                </ul>
            </section>

            <section id="quantumEspressoTab" v-bind:style="{display: quantumEspressoDisplay}">
                <br /><br />
                <label>Cards</label>
                <br /><br />
                <button type="button" name="controlCardBtn" class="button" v-on:click="cardDisplay($event)">CONTROL</button>
                <button type="button" name="systemCardBtn" class="button" v-on:click="cardDisplay($event)">SYSTEM</button>
                <button type="button" name="electronsCardBtn" class="button" v-on:click="cardDisplay($event)">ELECTRONS</button>
                <button type="button" name="atomicSpeciesCardBtn" class="button" v-on:click="cardDisplay($event)">ATOMIC_SPECIES</button>

                <br /><br />

                <section id="controlCard" name="controlCard" v-if="card == 'control' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Title:</label>
                            <input type="text" name="title" v-model="title" v-on:change="overviewBuilder()"/>
                        </li>
                        <li>
                            <label class="left">Calculation type:</label>
                            <select name="calculationType" v-model="calculation" v-on:change="overviewBuilder()">
                                <option>scf</option>
                                <option>nscf</option>
                                <option>bands</option>
                                <option>relax</option>
                                <option>md</option>
                                <option>vc-relax</option>
                                <option>vc-md</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Verbosity:</label>
                            <select name="verbosity" v-model="verbosity" v-on:change="overviewBuilder()">
                                <option>low</option>
                                <option>high</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Restart mode:</label>
                            <select name="restartMode" v-model="restart_mode" v-on:change="overviewBuilder()">
                                <option>from_scratch</option>
                                <option>restart</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">N of optimisation steps</label>
                            <input type="text" name="nsteps" v-model="nstep" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('nsteps')}" v-validate="'required|decimal'"/>
                        </li>
                        <li>
                            <label class="left">Calculate forces?</label>
                            <input type="radio" id="no" name="forces" value=".FALSE." checked="checked" v-model="forces" v-on:change="overviewBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="no">.false.</label>
                            &nbsp;&nbsp;&nbsp;
                            <input type="radio" id="yes" name="forces" value=".TRUE." v-model="forces" v-on:change="overviewBuilder()">
                            <label class="notLeft" style="margin-left:5px" for="yes">.true.</label>
                        </li>
                        <li>
                            <label class="left">Total E conv. threshold (a.u.):</label>
                            <input type="text" name="threshold" v-model="etot_conv_thr" v-on:change="overviewBuilder()"/>
                        </li>
                        <li>
                            <label class="left">Prefix</label>
                            <input type="text" name="prefix" v-model="prefix" v-on:change="overviewBuilder()"/>
                        </li>
                    </ul>
                </section>

                <section id="systemCard" name="systemCard" v-if="card == 'system' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Cc ibrav:</label>
                            <input type="text" name="ibrav" v-model="ibrav" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('ibrav')}" v-validate="'required|decimal'"/>
                        </li>
                        <li>
                            <label class="left">Cc occupations qq:</label>
                            <select name="occupations" v-model="occupations" v-on:change="overviewBuilder()">
                                <option>smearing</option>
                                <option>tetrahedra</option>
                                <option>tetrahedra_lin</option>
                                <option>tetrahedra_opt</option>
                                <option>fixed</option>
                                <option>form_input</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Cc smearing qq:</label>
                            <select name="smearing" v-model="smearing" v-on:change="overviewBuilder()">
                                <option>gaussian</option>
                                <option>methfezzel-paxton</option>
                                <option>marzari-vanderbilt</option>
                                <option>fermi-dirac</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Cc degauss:</label>
                            <input type="text" name="degauss" v-model="degauss" v-on:change="overviewBuilder()"/>
                        </li>
                    </ul>
                </section>

                <section id="electronsCard" name="electronsCard" v-if="card == 'electrons' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Cc diagonalization qq:</label>
                            <select name="diagonilization" v-model="disagonalization" v-on:change="overviewBuilder()">
                                <option>david</option>
                                <option>cg</option>
                                <option>ppcg</option>
                                <option>paro</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Cc electrion maxstep:</label>
                            <input type="text" name="electroMaxstep" v-model="electron_maxstep" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('electron_maxstep')}" v-validate="'required|decimal'"/>
                        </li>
                        <li>
                            <label class="left">Cc mixing beta:</label>
                            <input type="text" name="mixingBeta" v-model="mixing_beta" v-on:change="overviewBuilder()"/>
                        </li>
                    </ul>
                </section>

                <section id="atomicSpeciesCard" name="atomicSpeciesCard" v-if="card == 'atomic' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Choose element:</label>
                            <select name="element" v-model="element" v-on:change="">
                                <option v-for="e in elements">{{ e['element'] }}</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Choose pseudopotential file:</label>
                            <input type="file" ref="pseudopotentialFile" v-on:change="overviewBuilder($event)"/>
                            <button type="button" class="button" ref="clearpseudopotentialFile" name="clearPseudopotentialeFile" v-on:click="clearFile($event)">Clear</button>
                        </li>
                        <li>
                            <label class="left">Cc add psuedo:</label>
                            <button type="button" class="button" name="addPseudo" v-on:click="addPseudo()">ADD</button>
                        </li>
                    </ul>
                </section>
            </section>

            <ul>
                <li>
                    <label class="left">Overview (cannot edit!):</label>
                    <textarea id="fileContents" v-bind:value="inputFileContents" v-bind:rows="textAreaRows" v-bind:cols="textAreaColumns" style="width:auto;height:auto" readonly>
                    </textarea>
                </li>
                <li>
                    <label class="left">Save input file:</label>
                    <button type="button" class="button" v-on:click="downloadFileContents()">Download</button>
                </li>
                <li>
                    <label class="left">CPUs: </label>
                    <input type="text" name="cpus" v-model="cpus" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('cpus')}" v-validate="'required|decimal'"/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <label class="notLeft">Memory required in Gb:</label>
                    <input type="text" name="memory" v-model="memory" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('memory')}" v-validate="'required|decimal'"/>
                    <button type="button" class="button submit" name="orcaSubmit" v-on:click="onSubmit($event)" :disabled="isSubmitDisabled">SUBMIT</button>
                </li>
                <li>
                    <button type="button" class="button" name="checkStatus" v-on:click="checkStatus()">CHECK STATUS</button>
                </li>
            </ul>

        </form>
    </div>
</template>

<script>
    import Backbone from 'backbone'

    export default {
        name: 'ConexsSubmission',
        props: {},

        data: function(){
            return {
                inputFile: null,
                inputFileContents: '',
                textAreaRows: 25,
                textAreaColumns: 100,
                textAreaDisplay: 'inline',

                orcaDisplay: 'inline',
                elements: [
                    {'element': 'H', 'number': 1}, {'element': 'He', 'number': 2}, {'element': 'Li', 'number': 3}, {'element': 'Be', 'number': 4}, {'element': 'B', 'number': 5},
                    {'element': 'C', 'number': 6}, {'element': 'N', 'number': 7}, {'element': 'O', 'number': 8}, {'element': 'F', 'number': 9}, {'element': 'Ne', 'number': 10},
                    {'element': 'Na', 'number': 11}, {'element': 'Mg', 'number': 12}, {'element': 'Al', 'number': 13}, {'element': 'Si', 'number': 14}, {'element': 'P', 'number': 15},
                    {'element': 'S', 'number': 16}, {'element': 'Cl', 'number': 17}, {'element': 'Ar', 'number': 18}, {'element': 'K', 'number': 19}, {'element': 'Ca', 'number': 20},
                    {'element': 'Sc', 'number': 21}, {'element': 'Ti', 'number': 22}, {'element': 'V', 'number': 23}, {'element': 'Cr', 'number': 24}, {'element': 'Mn', 'number': 25},
                    {'element': 'Fe', 'number': 26}, {'element': 'Co', 'number': 27}, {'element': 'Ni', 'number': 28}, {'element': 'Cu', 'number': 29}, {'element': 'Zn', 'number': 30},
                    {'element': 'Ga', 'number': 31}, {'element': 'Ge', 'number': 32}, {'element': 'As', 'number': 33}, {'element': 'Se', 'number': 34}, {'element': 'Br', 'number': 35},
                    {'element': 'Kr', 'number': 36}, {'element': 'Rb', 'number': 37}, {'element': 'Sr', 'number': 38}, {'element': 'Y', 'number': 39}, {'element': 'Zr', 'number': 40},
                    {'element': 'Nb', 'number': 41}, {'element': 'Mo', 'number': 42}, {'element': 'Tc', 'number': 43}, {'element': 'Ru', 'number': 44}, {'element': 'Rh', 'number': 45},
                    {'element': 'Pd', 'number': 46}, {'element': 'Ag', 'number': 47}, {'element': 'Cd', 'number': 48}, {'element': 'In', 'number': 49}, {'element': 'Sn', 'number': 50},
                    {'element': 'Sb', 'number': 51}, {'element': 'Te', 'number': 52}, {'element': 'I', 'number': 53}, {'element': 'Xe', 'number': 54}, {'element': 'Cs', 'number': 55},
                    {'element': 'Ba', 'number': 56}, {'element': 'La', 'number': 57}, {'element': 'Ce', 'number': 58}, {'element': 'Pr', 'number': 59}, {'element': 'Nd', 'number': 60},
                    {'element': 'Pm', 'number': 61}, {'element': 'Sm', 'number': 62}, {'element': 'Eu', 'number': 63}, {'element': 'Gd', 'number': 64}, {'element': 'Tb', 'number': 65},
                    {'element': 'Dy', 'number': 66}, {'element': 'Ho', 'number': 67}, {'element': 'Er', 'number': 68}, {'element': 'Tm', 'number': 69}, {'element': 'Yb', 'number': 70},
                    {'element': 'Lu', 'number': 71}, {'element': 'Hf', 'number': 72}, {'element': 'Ta', 'number': 73}, {'element': 'W', 'number': 74}, {'element': 'Re', 'number': 75},
                    {'element': 'Os', 'number': 76}, {'element': 'Ir', 'number': 77}, {'element': 'Pt', 'number': 78}, {'element': 'Au', 'number': 79}, {'element': 'Hg', 'number': 80},
                    {'element': 'Tl', 'number': 81}, {'element': 'Pb', 'number': 82}, {'element': 'Bi', 'number': 83}, {'element': 'Po', 'number': 84}, {'element': 'At', 'number': 85},
                    {'element': 'Rn', 'number': 86}, {'element': 'Fr', 'number': 87}, {'element': 'Ra', 'number': 88}, {'element': 'Ac', 'number': 89}, {'element': 'Th', 'number': 90},
                    {'element': 'Pa', 'number': 91}, {'element': 'U', 'number': 92}, {'element': 'Np', 'number': 93}, {'element': 'Pu', 'number': 94}, {'element': 'Am', 'number': 95},
                    {'element': 'Cm', 'number': 96}, {'element': 'Bk', 'number': 97}, {'element': 'Cf', 'number': 98},
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
                fdmnes_result_file: 'result',
                fdmnes_abs_edge: ['K',
                         'L1', 'L2', 'L3',
                         'M1', 'M2', 'M3', 'M4', 'M5',
                ],
                fdmnes_method: '',
                fdmnes_edge: '',
                crystal: '',


                quantumEspressoDisplay: 'none',
                calculation: 'scf',
                etot_conv_thr: '',
                nstep: 0,
                prefix: '',
                restart_mode: 'from_scratch',
                title: '',
                forces: '',
                verbosity: 'low',

                ibrav: 0,
                occupations: '',
                smearing: '',
                degauss: '',

                disagonalization: '',
                electron_maxstep: 0,
                mixing_beta: '',

                card: 'control',

                isSubmitDisabled: true,
                clusterStatus: '',
                baseURL: '',
                form: ''
            }
        },

        created: function(){
            this.startCluster()

            // orca
            this.element = this.elements[0]['element']
            this.orca_edge = this.orca_abs_edge[0]
            this.functional = 'BLYP'
            this.basis = 'def2-SVP'
            this.solvent = this.orca_solvents[0]['name']
            this.technique = 'Xas'
            this.form = 'orca'

            //fdmnes
            this.fdmnes_edge = this.fdmnes_abs_edge[0]
            this.fdmnes_method = 'Green'
            this.crystal = 'Crystal'

            //qe
            this.forces = '.FALSE.'
            this.occupations = 'smearing'
            this.smearing = 'gaussian'

            this.overviewBuilder()
        },

        methods: {
            startCluster: function(){
                console.log('startCluster called')
                let self = this
                Backbone.ajax({
                    url: self.baseURL,
                    data: { login: app.user },
                    method: 'POST',
                    success: function(response){
                        if(response['cluster']){
                            if(response['cluster'] == 'new'){
                                console.log('starting new cluster for: ' + app.user)
                                self.isSubmitEnabled = false

                                setInterval(function(){
                                    self.pollClusterStatus()
                                }, 5000)

                            } else {
                                console.log('cluster already available for: ' + app.user)
                                self.isSubmitDisabled = false
                                self.clusterStatus = response['cluster'].status

                                setInterval(function(){
                                    self.pollClusterStatus()
                                }, 5000)
                            }
                        }
                    },
                    error: function(response){
                        console.log('error starting cluster: ' + response)
                        //app.alert({ title: 'Error', message: response })
                        self.clusterStatus = 'Unavailable, please try again later'
                        self.isSubmitDisabled = true
                    }
                })
            },

            pollClusterStatus: function(){
                let self = this
                Backbone.ajax({
                    url: self.baseURL + 'check_server',
                    data: {
                        login: app.user
                    },
                    method: 'POST', //should be a get really
                    success: function(response){
                        if(!response[app.user].status){
                            self.clusterStatus = 'Unavailable'
                        } else {
                            self.clusterStatus = response[app.user].status
                        }

                        if(self.clusterStatus == 'Sleeping' || self.clusterStatus == 'Running'){
                            self.isSubmitDisabled = false
                        } else {
                            self.isSubmitDisabled = true
                        }
                    },
                    error: function(response){
                        console.log('error getting cluster status: ' + response)
                        //app.alert({ title: 'Error', message: response })
                        self.clusterStatus = 'Unavailable'
                        self.isSubmitDisabled = true
                    }
                })
            },

            tabDisplay: function(event){
                var name = event.target.name

                this.$refs.inputFile.value = ''
                this.$refs.orcaStructureFile.value = ''
                this.$refs.fdmnesStructureFile.value = ''
                
                // We could use the card logic here, but the input file clearing above will need refactoring too
                // With v-if == false the section is not rendered to the DOM at all so we get undefined var errors
                switch(name){
                    case "orcaTabButton":
                        this.orcaDisplay = 'inline'
                        this.fdmnesDisplay = 'none'
                        this.quantumEspressoDisplay = 'none'
                        this.form = 'orca'
                        break
                    case "fdmnesTabButton":
                        this.orcaDisplay = 'none'
                        this.fdmnesDisplay = 'inline'
                        this.quantumEspressoDisplay = 'none'
                        this.form = 'fdmnes'
                        break
                    case "quantumEspressoTabButton":
                        this.orcaDisplay = 'none'
                        this.fdmnesDisplay = 'none'
                        this.quantumEspressoDisplay = 'inline'
                        this.controlCardDisplay = true
                        this.form = 'qe'
                        break
                }
                this.overviewBuilder()
            },

            /**
             * Handle which card to show on the QE tab
             */
            cardDisplay: function(event){
                var name = event.target.name

                switch(name){
                    case "controlCardBtn":
                        this.card = 'control'
                        break
                    case "systemCardBtn":
                        this.card = 'system'
                        break
                    case "electronsCardBtn":
                        this.card = 'electrons'
                        break
                    case "atomicSpeciesCardBtn":
                        this.card = 'atomic'
                        break
                    default:
                        this.card = 'control'
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
            },

            /**
             * Changing tabs too quick can mess up with overview box
             * Could disable the tab buttons until overview is ready?
             */
            overviewBuilder: function(event){
                if(this.orcaDisplay == 'inline')
                    this.orcaOverviewBuilder(event)
                else if(this.fdmnesDisplay == 'inline')
                    this.fdmnesOverviewBuilder(event)
                else if(this.quantumEspressoDisplay == 'inline')
                    this.quantumEspressoOverviewBuilder(event)
                else
                    console.log('Unspecified tab is displaying, no overviewBuilder function available')

            },

            // Build overview file/string based on form inputs or files uploaded
            // Will re-run on change of almost all form elements
            orcaOverviewBuilder: function(event){
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

            fdmnesOverviewBuilder: function(event){
                this.output = 'Filout' + "\n"
                this.output += this.fdmnes_result_file + "\n\n"
                this.output += 'Range' + "\n"
                this.output += '-10. 0.25 50' + '       !E_min, step, E_intermediate, step ...' + "\n\n"
                this.output += 'Edge' + "\n"
                this.output += this.fdmnes_edge + "\n\n"
                this.output += 'Z_absorber' + "\n"

                for(var i=0; i<this.elements.length; i++){
                    if(this.element == this.elements[i]['element']){
                        this.output += this.elements[i]['number'] + "\n\n"
                    }
                }

                this.output += 'SCF' + '        !Performs self-consistent calculation' + "\n"
                this.output += 'Energpho' + '       !Output energy relative to the photon energy of absorbing atom' + "\n\n"
                this.output += this.fdmnes_method + "\n"
                this.output += 'Quadrupole' + "\n"

                if(this.fdmnes_edge.includes('L'))
                    this.output += 'Spinorbit' + "\n\n"
                else
                    this.output += "\n"

                this.output += 'Radius' + '     ! Radius of the cluster where final state calculation is performed' + "\n"
                this.output += '6' + "\n\n"

                var ready = false
                let self = this
                var check = function(){
                    if(ready){
                        self.output += "\n\n"
                        self.output += 'Convolution' + "\n\n"
                        self.output += 'End'
                        self.inputFileContents = self.output
                        self.output = ''
                        self.resizeOverview()
                    } else {
                        setTimeout(check, 1000)
                    }
                }
                check()

                if (event && event.target.files[0]) {
                    var structureFileName = event.target.files[0].name

                    if(structureFileName.endsWith('.cif')){
                        this.output += 'Cif_file' + "\n"
                        this.output += structureFileName
                    }
                    else if(structureFile.endsWith('.pdb')){
                        this.output += 'Pdb_file' + "\n"
                        this.output += structureFileName
                    }
                    else {
                        if(this.crystal == 'Crystal')
                            this.output += 'Crystal' + '        ! Periodic material description (unit cell)' + "\n"
                        else if(this.crystal == 'Molecule')
                            this.output += 'Molecule' + '       ! Periodic or cylindrical or spherical coordinates' + "\n"

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
                    }
                } else {
                    if(this.crystal == 'Crystal')
                        this.output += 'Crystal' + '        ! Periodic material description (unit cell)' + "\n"
                    else if(this.crystal == 'Molecule')
                        this.output += 'Molecule' + '       ! Periodic or cylindrical or spherical coordinates' + "\n"
                    ready = true
                }

            },

            quantumEspressoOverviewBuilder: function(event){
                this.output = "&CONTROL'\n"
                this.output += " calculation = \'" + this.calculation + "\'\n"
                this.output += " etot_conv_thr = " + this.etot_conv_thr + "\n"
                this.output += " nstep = " + this.nstep + "\n"
                this.output += " out_dir = \'.\/\' \n" // SHOULD THIS BE EDITABLE ON THE FORM?
                this.output += " prefix = \'" + this.prefix + "\' \n"
                this.output += " pseudo_dir = \'\/\' \n"
                this.output += " restart_mode = \'" + this.restart_mode + "\' \n"
                this.output += " title = \'" + this.title + "\' \n"
                this.output += " tprnfor = " + this.forces + "\n"
                this.output += " verbosity = \'" + this.verbosity + "\' \n"
                this.output += "/ \n\n"

                this.output += "&SYSTEM \n"
                this.output += " degauss = " + this.degauss + "\n"
                this.output += " ibrav = " + this.ibrav + "\n"
                this.output += " occupations = " + this.occupations + "\n"
                this.output += " smearing = " + this.smearing + "\n"
                this.output += "/ \n\n"

                this.output += "&ELECTRONS \n"
                this.output += " diagonalization = \'" + this.disagonalization + "\'\n"
                this.output += " electron_maxstep = " + this.electron_maxstep + "\n"
                this.output += " mixing_beta = " + this.mixing_beta + "\n"
                this.output += "/ \n\n"

                this.output += "ATOMIC_SPECIES"

                this.inputFileContents = this.output
                this.output = ''
            },

            /**
             * Resize text area to display the entire file without scrollbars
             */
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

            /**
             * Download contents of the overview text area as a .txt file
             */
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

            /**
             * Allow user to clear a file from input dialog without selecting a new file
             */
            clearFile: function(e){
                console.log(e)
                switch (e.target.name){
                    case 'clearInputFile':
                        this.$refs.inputFile.value = ''
                        break
                    case 'clearStructureFile':
                        this.$refs.orcaStructureFile.value = ''
                        this.$refs.fdmnesStructureFile.value = ''
                        break
                }
                this.overviewBuilder()
            },

            addPseudo: function(){
                // Works but not correct data being shown, would need to be from xraydb
                // Will leave this for the server side to figure out
                for(var i=0; i<this.elements.length; i++){
                    if(this.element == this.elements[i]['element']){
                        this.inputFileContents += "\n" + this.element + " " + this.elements[i]['number']
                    }
                }
            },

            onSubmit: function(e){
                e.preventDefault()
                let self = this

                this.$validator.validateAll().then(function(result){
                    if(result && self.inputFileContents != ''){

                        Backbone.ajax({
                            url: self.baseURL + 'upload_' + self.form,
                            data: {
                                data: self.inputFileContents,
                                charge: self.charge,
                                multiplicity: self.multiplicity,
                                memory: self.memory,
                                fedid: app.user,

                                fdmnes_method: self.method,
                                fdmnes_edge: self.fdmnes_edge,
                                crystal: self.crystal,

                                calculation: self.calculation,
                                etot_conv_thr: self.etot_conv_thr,
                                nstep: self.nstep,
                                prefix: self.prefix,
                                restart_mode: self.restart_mode,
                                title: self.title,
                                forces: self.forces,
                                verbosity: self.verbosity,

                                ibrav: self.ibrav,
                                occupations: self.occupations,
                                smearing: self.smearing,
                                degauss: self.degauss,

                                disagonalization: self.disagonalization,
                                electron_maxstep: self.electron_maxstep,
                                mixing_beta: self.mixing_beta,
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
                })
            },

            checkStatus: function(){
                app.alert({className: 'message notify', message: 'Status check not yet implemented.'})
            }
        },
    }
</script>

<style scoped>
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
    li {
        padding: 5px;
    }
</style>