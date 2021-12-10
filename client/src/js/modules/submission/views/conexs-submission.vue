<template>
    <div>
        <button name="orcaTabButton" ref="orcaTabButton" class="button" v-on:click="tabDisplay($event)">ORCA</button>
        <button name="fdmnesTabButton" ref="fdmnesTabButton" class="button" v-on:click="tabDisplay($event)">FDMNES</button>
        <button name="quantumEspressoTabButton" ref="quantumEspressoTabButton" class="button" v-on:click="tabDisplay($event)">Quantum Espresso</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span>Cluster status: {{ clusterStatus }}</span>&nbsp;&nbsp;&nbsp;<i v-if="clusterStatus != 'Running' && clusterStatus != 'Sleeping' && clusterStatus != 'Unavailable'" class="fa icon grey fa-cog fa-spin"></i>
        <!--THIS IS TO EASILY SWAP BETWEEN K8S AND WS ENDPOINTS AND SHOULD BE REMOVED BEFORE GOING TO PRODUCTION!!-->
        <span>IP:Port:<input type="text" v-model="baseURL" style="width:200px"/></span>
        <br />

        <form v-on:submit.prevent="onSubmit" method="post" id="submit-orca" v-bind:class="{loading: isLoading}" style="border:1px solid #ccc">

            <br />
            <label class="left">Input file already exists (*.inp)?</label>
            <input type="file" ref="inputFile" v-on:change="setInputFile($event)"/>
            <button type="button" ref="clearInputFile" name="clearInputFile" class="button" v-on:click="clearFile($event)">Clear </button>

            <section id="orcaTab" v-bind:style="{display: orcaDisplay}">
                <div style="float:right; width:30%; height:30%">
                    <p>ORCA is an ab initio, DFT, and semi-empirical SCF-MO package developed by Frank Neese et al. at the Max Planck Institut für Kohlenforschung.</p>
                    <br/>

                    <span>ORCA webpage at Max-Planck-Institut: <a href="https://www.kofo.mpg.de/en/research/services/orca">https://www.kofo.mpg.de/en/research/services/orca</a></span>
                    <br/>
                    <span>ORCA manual: <a href="https://www.kofo.mpg.de/412442/orca_manual-opt.pdf">https://www.kofo.mpg.de/412442/orca_manual-opt.pdf</a></span>
                    <br/>
                    <span>ORCA input library website: <a href="https://sites.google.com/site/orcainputlibrary/home">https://sites.google.com/site/orcainputlibrary/home</a></span>
                    <br/><br/>

                    <p>In general, the input file is a free format ASCII file and can contain one or more keyword lines that start
                    with a "!" sign, one or more input blocks enclosed between an \%" sign and \end" that provide finer control
                    over specific aspects of the calculation, and finally the specification of the coordinates for the system along
                    with the charge and multiplicity provided either with a %coords block, or more usually enclosed within two
                    "*" symbols. Here is an example of a simple input file that contains all three input elements:</p>
                    <br/>

                    <p>! HF def2-TZVP</p>
                    <br/>

                    <span>%scf</span>
                    <br/>
                    <span>convergence tight</span>
                    <br/>
                    <span>end</span>
                    <br/><br/>

                    <span>* xyz 0 1</span>
                    <br/>
                    <span>C 0.0 0.0 0.0</span>
                    <br/>
                    <span>O 0.0 0.0 1.13</span>
                    <br/>
                    <span>*</span>
                    <br/><br/>


                    <p>Comments in the file start by a \#". For example:</p>
                    <br/>

                    <p># This is a comment. Continues until the end of the line</p>
                    <br/>

                    <p>The input may contain several blocks, which consist of logically related data that can be user controlled. The
                    program tries to choose sensible default values for all of these variables. However, it is impossible to give
                    defaults that are equally sensible for all systems. In general the defaults are slightly on the conservative
                    side and more aggressive cutoffs etc. can be chosen by the user and may help to speed things up for actual
                    systems or give higher accuracy if desired.</p>
                </div>
                <ul>
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
                        <select name="functional" v-model="functional" v-on:change="overviewBuilder()" title="BLYP is a generalized gradient approximation (GGA) DFT functional;
B3LYP is a hybrid DFT GGA functional (20% HF exchange).">
                            <option>BLYP</option>
                            <option>B3LYP</option>
                        </select>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                        <label class="notLeft">Basis:</label>
                        <select name="basis" v-model="basis" v-on:change="overviewBuilder()" title="These basis sets are all-electron for elements H-Kr, and automatically load Stuttgart-Dresden effective core potentials for elements Rb-Rn.
def2-SVP is a valence double-zeta basis set with 'new' polarization functions.
def2-SV(P) is the same with slightly reduced polarization.">
                            <option>def2-SVP</option>
                            <option>def2-SV(P)</option>
                        </select>
                    </li>
                    <li>
                        <label class="left">Charge value:</label>
                        <input type="text" name="charge" v-model="charge" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('charge')}" v-validate="'required|decimal'" title="Total charge of the system" />
                        <label class="notLeft">Multiplicity value:</label>
                        <input type="text" name="multiplicity" v-model="multiplicity" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('multiplicity')}" v-validate="'required|decimal'" title="The multiplicity = 2S+1" />
                        <label class="notLeft" style="margin-right:5px">Solvent:</label>
                        <select name="solvent" v-model="solvent" v-on:change="overviewBuilder()" title="Add solvent if necessary">
                            <option v-for="s in orca_solvents">{{ s['name'] }}</option>
                        </select>
                    </li>
                    <li v-if="technique == 'Xas'">
                        <label class="left">OrbWin[0] Start:</label>
                        <input type="text" name="orbWin0Start" v-model="orbWin0Start" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('orbWin0Start')}" v-validate="'required|numeric|min_value:0'" title="orbwin[0] - Start, Stop, -1, -1
e.g. 0,0,-1,-1 # Selecting the alpha set (orbwin[0]). Selecting donor orbital range : 0 to 0 (the lowest energy
orbital only, means K-edge) and acceptor orbital range: -1 to -1 (meaning all virtual orbitals)"/>
                        <span v-if="errors.has('orbWin0Start')" class="errormessage ferror">{{ errors.first('orbWin0Start') }}</span>

                        <label class="notLeft">OrbWin[0] Stop:</label>
                        <input type="text" name="orbWin0Stop" v-model="orbWin0Stop" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('orbWin0Stop')}" v-validate="'required|numeric|min_value:0'" title="orbwin[0] - Start, Stop, -1, -1
e.g. 0,0,-1,-1 # Selecting the alpha set (orbwin[0]). Selecting donor orbital range : 0 to 0 (the lowest energy
orbital only, means K-edge) and acceptor orbital range: -1 to -1 (meaning all virtual orbitals)"/>
                        <span v-if="errors.has('orbWin0Stop')" class="errormessage ferror">{{ errors.first('orbWin0Stop') }}</span>
                    </li>
                    <li v-if="technique == 'Xas'">
                        <label class="left">OrbWin[1] Start:</label>
                        <input type="text" name="orbWin1Start" v-model="orbWin1Start" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('orbWin1Start')}" v-validate="'required|numeric|min_value:0'" title="orbwin[1] - Start, Stop, -1, -1
e.g. 0,0,-1,-1 # Selecting the beta set in the same way as the alpha set. Not necessary if system is closed-shell."/>
                        <span v-if="errors.has('orbWin1Start')" class="errormessage ferror">{{ errors.first('orbWin1Start') }}</span>

                        <label class="notLeft">OrbWin[1] Stop:</label>
                        <input type="text" name="orbWin1Stop" v-model="orbWin1Stop" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('orbWin1Stop')}" v-validate="'required|numeric|min_value:0'" title="orbwin[1] - Start, Stop, -1, -1
e.g. 0,0,-1,-1 # Selecting the beta set in the same way as the alpha set. Not necessary if system is closed-shell.
"/>
                        <span v-if="errors.has('orbWin1Stop')" class="errormessage ferror">{{ errors.first('orbWin1Stop') }}</span>
                    </li>
                    <li>
                        <label class="left">Load structure (*xyz, *txt, *dat):</label>
                        <input type="file" ref="orcaStructureFile" v-on:change="setStructureFile($event); overviewBuilder($event)" title="Use file for structure (must be in correct format) or manually add structure using Atoms"/>
                        <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                    </li>
                </ul>
            </section>

            <section id="fdmnesTab" v-bind:style="{display: fdmnesDisplay}">
                <ul>
                    <li>
                        <label class="left">Result filename (no extension) </label>
                        <input type="text" name="fdemnes_result_file" v-model="fdmnes_result_file" v-on:change="overviewBuilder()">
                    </li>

                    <li>
                        <label class="left">Element:</label>
                        <select name="element" v-model="element" v-on:change="overviewBuilder()">
                            <option v-for="e in elements">{{ e['element'] }}</option>
                        </select>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                        <label class="notLeft">Absorption edge:</label>
                        <select name="absorbEdge" v-model="fdmnes_edge" v-on:change="overviewBuilder()">
                            <option v-for="edge in fdmnes_abs_edge">{{ edge }}</option>
                        </select>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
                        <input type="file" ref="fdmnesStructureFile" v-on:change="setStructureFile($event); overviewBuilder($event)"/>
                        <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                    </li>
                </ul>
            </section>

            <section id="quantumEspressoTab" v-bind:style="{display: quantumEspressoDisplay}">
                <br /><br />
                <label>Cards</label>
                <br /><br />
                <button type="button" name="controlCardBtn" ref="controlCardBtn" class="button" v-on:click="cardDisplay($event)">CONTROL</button>
                <button type="button" name="systemCardBtn" ref="systemCardBtn" class="button" v-on:click="cardDisplay($event)">SYSTEM</button>
                <button type="button" name="electronsCardBtn" ref="electronsCardBtn" class="button" v-on:click="cardDisplay($event)">ELECTRONS</button>
                <button type="button" name="atomicSpeciesCardBtn" ref="atomicSpeciesCardBtn" class="button" v-on:click="cardDisplay($event)">ATOMIC_SPECIES</button>
                <button type="button" name="atomicPositionCardBtn" ref="atomicPositionCardBtn" class="button" v-on:click="cardDisplay($event)">ATOMIC_POSITION</button>
                <button type="button" name="cellParamsCardBtn" ref="cellParamsCardBtn" class="button" v-on:click="cardDisplay($event)">CELL_PARAMETERS</button>

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
                            <span v-if="errors.has('nsteps')" class="errormessage ferror">{{ errors.first('nsteps') }}</span>
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
                            <label class="left">nat:</label>
                            <input type="text" name="nat" v-model="nat" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('nat')}" v-validate="'required|numeric|min_value:1|max_value:100'"/>
                            <span v-if="errors.has('nat')" class="errormessage ferror">{{ errors.first('nat') }}</span>
                        </li>
                        <li>
                            <label class="left">ntyp:</label>
                            <input type="text" name="ntyp" v-model="ntyp" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('ntyp')}" v-validate="'required|numeric|min_value:1|max_value:100'"/>
                            <span v-if="errors.has('ntyp')" class="errormessage ferror">{{ errors.first('ntyp') }}</span>
                        </li>
                        <li>
                            <label class="left">ecutwfc:</label>
                            <input type="text" name="ecutwfc" v-model="ecutwfc" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('ecutwfc')}" v-validate="'required|decimal'"/>
                            <span v-if="errors.has('ecutwfc')" class="errormessage ferror">{{ errors.first('ecutwfc') }}</span>
                        </li>

                        <!--
                            This is crazy.
                            The above 3 fields should be underneath the 4 below but:
                            The 'nat' field validation rules don't work like this but the others do.
                            If I comment out occupations, smearing and degauss (but keep ibrav) then it all works
                            If I uncomment one of the 3 fields then the non working field validation moves to the next field (ntyp or ecutwfc)
                            If I move nat, ntyp & ecutwfc to the top of this list and keep all fields then everything works (current solution for now)

                            WHAT IS GOING ON?!?!?
                        -->

                        <li>
                            <label class="left">Cc ibrav:</label>
                            <input type="text" name="ibrav" v-model="ibrav" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('ibrav')}" v-validate="'required|decimal'"/>
                            <span v-if="errors.has('ibrav')" class="errormessage ferror">{{ errors.first('ibrav') }}</span>
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
                            <input type="text" name="electronMaxstep" v-model="electron_maxstep" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('electronMaxstep')}" v-validate="'required|decimal'"/>
                            <span v-if="errors.has('electronMaxstep')" class="errormessage ferror">{{ errors.first('electronMaxstep') }}</span>
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
                            <label class="left">Pseudopotentials:</label>
                            <table-component
                                :headers="[{key: 'Element', title: 'Element'}, {key: 'Filename', title: 'Filename'}]"
                                :data="qePseudos"
                                actions="Actions"
                                addRow="addRow"
                                style="width:40%"
                            >
                                <template slot="actions" slot-scope="{ row }">
                                    <button type="button" class="button" v-on:click="removePseudo(row.ID); overviewBuilder()">Remove</button>
                                </template>
                                <template slot="addRow" slot-scope="{ row }">
                                    <td>
                                        <select name="atom" v-model="atom">
                                            <option v-for="e in elements">{{ e['element'] }}</option>
                                        </select>
                                    </td>
                                    <td><input type="file" ref="pseudoFile" name="pseudoFile" v-on:change="setPseudoFile($event)"/></td>
                                    <td><button class="button" type="button" v-on:click="addPseudo(); overviewBuilder()">Add</button></td>
                                </template>
                            </table-component>
                        </li>
                    </ul>
                </section>
                <section id="atomicPositionCard" name="atomicPositionCard" v-if="card == 'position' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">ATOMIC_POSITIONS:</label>
                            <select name="atomicPositionType" v-model="atomicPositionType" v-on:change="overviewBuilder()">
                                <option>bohr</option>
                                <option>angstrom</option>
                                <option>crystal</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Atoms:</label>
                            <table-component
                                :headers="atomHeaders"
                                :data="atomData"
                                actions="Actions"
                                addRow="addRow"
                                style="width:40%"
                            >
                                <template slot="actions" slot-scope="{ row }">
                                    <button type="button" class="button" v-on:click="removeAtom(row.ID); overviewBuilder()">Remove</button> 
                                </template>
                                <template slot="addRow" slot-scope="{ row }">
                                    <td>
                                        <select name="atom" v-model="atom">
                                            <option v-for="e in elements">{{ e['element'] }}</option>
                                        </select>
                                    </td>
                                    <td><input type="text" v-model="atomX" name="atomX" v-bind:class="{ferror: errors.has('atomX')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><input type="text" v-model="atomY" name="atomY" v-bind:class="{ferror: errors.has('atomY')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><input type="text" v-model="atomZ" name="atomZ" v-bind:class="{ferror: errors.has('atomZ')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><button class="button" type="button" v-on:click="addAtom(); overviewBuilder()">Add</button></td>
                                </template>
                            </table-component>
                        </li>
                    </ul>
                </section>
                <section id="cellParametersCard" name="cellParametersCard" v-if="card =='cellParams' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Cell Parameters Type:</label>
                            <select name="cellParamsType" v-model="cellParamsType" v-on:change="overviewBuilder()">
                                <option>bohr</option>
                                <option>angstrom</option>
                            </select>
                        </li>
                        <li>
                            <label class="left">Cell Parameters:</label>
                            <table-component
                                :headers="[{key: 'X', title: 'X'}, {key: 'Y', title: 'Y'}, {key: 'Z', title: 'Z'}]"
                                :data="cellParamData"
                                actions="Vector"
                                style="width:40%"
                            >
                                <template slot="actions" slot-scope="{ row }">
                                    <span>{{ 'V'+row.ID }}</span>
                                </template>
                                <template slot="content" slot-scope="{ row }">
                                    <td><input type="text" v-model="row.X" :name="row.ID+'X'" v-bind:class="{ferror: errors.has(row.ID+'X')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                                    <td><input type="text" v-model="row.Y" :name="row.ID+'Y'" v-bind:class="{ferror: errors.has(row.ID+'Y')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                                    <td><input type="text" v-model="row.Z" :name="row.ID+'Z'" v-bind:class="{ferror: errors.has(row.ID+'Z')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                                </template>
                            </table-component>
                        </li>
                    </ul>
                </section>
            </section>

            <ul>
                <!-- This gets pushed out of alignment because li tags inside a form are considered flex containers. This means the helper text floating right is in the way and pushes it out
                    We can fix it by adding display: block but the same will happen to other elements if the page is resized. -->
                <li>
                    <label class="left">Overview (cannot edit!):</label>
                    <textarea id="fileContents" v-bind:value="inputFileContents" v-bind:rows="textAreaRows" v-bind:cols="textAreaColumns" style="width:auto;height:auto" title="Job overview to be submitted to the calculation cluster" readonly>
                    </textarea>
                </li>

                <li v-if="fdmnesDisplay == 'inline'">
                    <label class="left">Params:</label>
                    <table-component
                        :headers="fdmnesParameterHeaders"
                        :data="fdmnesParams"
                    >
                        <template slot="content" slot-scope="{ row }">
                            <td><input type="text" v-model="fdmnesParams[0].A" name="fdmnesParamA" v-bind:class="{ferror: errors.has('fdmnesParamA')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                            <td><input type="text" v-model="fdmnesParams[0].B" name="fdmnesParamB" v-bind:class="{ferror: errors.has('fdmnesParamB')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                            <td><input type="text" v-model="fdmnesParams[0].C" name="fdmnesParamC" v-bind:class="{ferror: errors.has('fdmnesParamC')}" v-validate="'required|decimal|min_value:-100|max_value:100'" v-on:change="overviewBuilder()"/></td>
                            <td><input type="text" v-model="fdmnesParams[0].Alpha" name="fdmnesParamAlpha" v-bind:class="{ferror: errors.has('fdmnesParamAlpha')}" v-validate="'required|decimal|min_value:0|max_value:180'" v-on:change="overviewBuilder()"/></td>
                            <td><input type="text" v-model="fdmnesParams[0].Beta" name="fdmnesParamBeta" v-bind:class="{ferror: errors.has('fdmnesParamBeta')}" v-validate="'required|decimal|min_value:0|max_value:180'" v-on:change="overviewBuilder()"/></td>
                            <td><input type="text" v-model="fdmnesParams[0].Gamma" name="fdmnesParamGamma" v-bind:class="{ferror: errors.has('fdmnesParamGamma')}" v-validate="'required|decimal|min_value:0|max_value:180'" v-on:change="overviewBuilder()"/></td>
                        </template>
                    </table-component>
                </li>

                <li>
                    <label v-if="quantumEspressoDisplay != 'inline'" class="left">Atoms:</label>
                    <table-component
                        :headers="atomHeaders"
                        :data="atomData"
                        actions="Actions"
                        addRow="addRow"
                        v-if="orcaDisplay == 'inline' || fdmnesDisplay == 'inline'"
                        title="Define system structure as atom and position (Angstrom)"
                    >
                        <template slot="actions" slot-scope="{ row }">
                            <button type="button" class="button" v-on:click="removeAtom(row.ID); overviewBuilder()">Remove</button> 
                        </template>
                        <template slot="addRow" slot-scope="{ row }">
                            <td>
                                <select name="atom" v-model="atom" v-bind:class="{ferror: errors.has('atom')}" v-validate="'required'">
                                    <option v-for="e in elements">{{ e['element'] }}</option>
                                </select>
                            </td>
                            <td><input type="text" v-model="atomX" name="atomX" v-bind:class="{ferror: errors.has('atomX')}" v-validate="atomRules"/></td>
                            <td><input type="text" v-model="atomY" name="atomY" v-bind:class="{ferror: errors.has('atomY')}" v-validate="atomRules"/></td>
                            <td><input type="text" v-model="atomZ" name="atomZ" v-bind:class="{ferror: errors.has('atomZ')}" v-validate="atomRules"/></td>
                            <td><button class="button" type="button" v-on:click="addAtom(); overviewBuilder()">Add</button></td>
                        </template>
                    </table-component>
                </li>
                <li>
                    <label class="left">Save input file:</label>
                    <button type="button" class="button" v-on:click="downloadFileContents()">Download</button>
                </li>
                <li>
                    <label class="left">CPUs: </label>
                    <input type="text" name="cpus" v-model="cpus" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('cpus')}" v-validate="'required|decimal'"/>
                    <span v-if="errors.has('cpus')" class="errormessage ferror">{{ errors.first('cpus') }}</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <label class="notLeft">Memory required in Gb:</label>
                    <input type="text" name="memory" v-model="memory" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('memory')}" v-validate="'required|decimal'"/>
                    <span v-if="errors.has('memory')" class="errormessage ferror">{{ errors.first('memory') }}</span>
                    <!-- SWAP THE TWO BUTTONS BELOW FOR PRODUCTION (Will disable submit if cluster not ready) -->
                    <!--<button type="button" class="button submit" name="orcaSubmit" v-on:click="onSubmit($event)" :disabled="isSubmitDisabled">SUBMIT</button>-->
                    <button type="button" class="button submit" name="orcaSubmit" v-on:click="onSubmit($event)">SUBMIT</button>
                </li>

                <hr style="border:1px solid #ccc"/>

                <li v-if="jobData.length">
                    <label class="left">Your Job Status'</label>
                    <table-component
                        :headers="[{key: 'jobID', title: 'Job ID'}, {key: 'jobType', title: 'Job Type'}, {key: 'jobStatus', title: 'Job Status'}]"
                        :data="jobData"
                        actions="Actions"
                        title="Status of requested and running jobs"
                    >
                        <template slot="actions" slot-scope="{ row }">
                            <button type="button" :ref="'job'+row.jobID" class="button" v-on:click="killJob(row.jobID)">Kill Job</button>
                        </template>

                    </table-component>
                </li>
            </ul>

        </form>
    </div>
</template>

<script>
    import Backbone from 'backbone'
    import Table from 'app/components/table.vue'

    export default {
        name: 'ConexsSubmission',
        props: {},
        components: {
            'table-component': Table,
        },

        data: function(){
            return {
                // Shared
                inputFile: null,
                inputFileContents: '',
                textAreaRows: 25,
                textAreaColumns: 100,
                textAreaDisplay: 'inline',
                cpus: 4,
                memory: 16,
                output: '',
                elements: [
                    {'element': 'H', 'number': 1, 'mass': 1.0078}, {'element': 'He', 'number': 2, 'mass': 4.0026}, {'element': 'Li', 'number': 3, 'mass': 6.94},
                    {'element': 'Be', 'number': 4, 'mass': 9.0122}, {'element': 'B', 'number': 5, 'mass': 10.81}, {'element': 'C', 'number': 6, 'mass': 12.011},
                    {'element': 'N', 'number': 7, 'mass': 14.007}, {'element': 'O', 'number': 8, 'mass': 15.999}, {'element': 'F', 'number': 9, 'mass': 18.9984},
                    {'element': 'Ne', 'number': 10, 'mass': 20.1797}, {'element': 'Na', 'number': 11, 'mass': 22.9898}, {'element': 'Mg', 'number': 12, 'mass': 24.305},
                    {'element': 'Al', 'number': 13, 'mass': 26.9815}, {'element': 'Si', 'number': 14, 'mass': 28.085}, {'element': 'P', 'number': 15, 'mass': 30.9738},
                    {'element': 'S', 'number': 16, 'mass': 32.06}, {'element': 'Cl', 'number': 17, 'mass': 35.453}, {'element': 'Ar', 'number': 18, 'mass': 39.948},
                    {'element': 'K', 'number': 19, 'mass': 39.0983}, {'element': 'Ca', 'number': 20, 'mass': 40.078}, {'element': 'Sc', 'number': 21, 'mass': 44.9559},
                    {'element': 'Ti', 'number': 22, 'mass': 47.867}, {'element': 'V', 'number': 23, 'mass': 50.9415}, {'element': 'Cr', 'number': 24, 'mass': 51.996},
                    {'element': 'Mn', 'number': 25, 'mass': 54.938}, {'element': 'Fe', 'number': 26, 'mass': 55.845}, {'element': 'Co', 'number': 27, 'mass': 58.9332},
                    {'element': 'Ni', 'number': 28, 'mass': 58.6934}, {'element': 'Cu', 'number': 29, 'mass': 63.546}, {'element': 'Zn', 'number': 30, 'mass': 65.38},
                    {'element': 'Ga', 'number': 31, 'mass': 69.72}, {'element': 'Ge', 'number': 32, 'mass': 72.63}, {'element': 'As', 'number': 33, 'mass': 74.9216},
                    {'element': 'Se', 'number': 34, 'mass': 78.971}, {'element': 'Br', 'number': 35, 'mass': 79.904}, {'element': 'Kr', 'number': 36, 'mass': 83.798},
                    {'element': 'Rb', 'number': 37, 'mass': 85.4678}, {'element': 'Sr', 'number': 38, 'mass': 87.62}, {'element': 'Y', 'number': 39, 'mass': 88.9058},
                    {'element': 'Zr', 'number': 40, 'mass': 91.224}, {'element': 'Nb', 'number': 41, 'mass': 92.9064}, {'element': 'Mo', 'number': 42, 'mass': 95.95},
                    {'element': 'Tc', 'number': 43, 'mass': 97.907}, {'element': 'Ru', 'number': 44, 'mass': 101.07}, {'element': 'Rh', 'number': 45, 'mass': 102.906},
                    {'element': 'Pd', 'number': 46, 'mass': 106.42}, {'element': 'Ag', 'number': 47, 'mass': 107.868}, {'element': 'Cd', 'number': 48, 'mass': 112.414},
                    {'element': 'In', 'number': 49, 'mass': 114.818}, {'element': 'Sn', 'number': 50, 'mass': 118.71}, {'element': 'Sb', 'number': 51, 'mass': 121.76},
                    {'element': 'Te', 'number': 52, 'mass': 127.6}, {'element': 'I', 'number': 53, 'mass': 126.905}, {'element': 'Xe', 'number': 54, 'mass': 131.293},
                    {'element': 'Cs', 'number': 55, 'mass': 132.905}, {'element': 'Ba', 'number': 56, 'mass': 137.327}, {'element': 'La', 'number': 57, 'mass': 138.905},
                    {'element': 'Ce', 'number': 58, 'mass': 140.116}, {'element': 'Pr', 'number': 59, 'mass': 140.908}, {'element': 'Nd', 'number': 60, 'mass': 144.242},
                    {'element': 'Pm', 'number': 61, 'mass': 145.0}, {'element': 'Sm', 'number': 62, 'mass': 150.36}, {'element': 'Eu', 'number': 63, 'mass': 151.96},
                    {'element': 'Gd', 'number': 64, 'mass': 157.25}, {'element': 'Tb', 'number': 65, 'mass': 158.925}, {'element': 'Dy', 'number': 66, 'mass': 162.5},
                    {'element': 'Ho', 'number': 67, 'mass': 164.93}, {'element': 'Er', 'number': 68, 'mass': 167.259}, {'element': 'Tm', 'number': 69, 'mass': 168.934},
                    {'element': 'Yb', 'number': 70, 'mass': 173.045}, {'element': 'Lu', 'number': 71, 'mass': 174.967}, {'element': 'Hf', 'number': 72, 'mass': 178.49},
                    {'element': 'Ta', 'number': 73, 'mass': 180.948}, {'element': 'W', 'number': 74, 'mass': 183.84}, {'element': 'Re', 'number': 75, 'mass': 186.207},
                    {'element': 'Os', 'number': 76, 'mass': 190.23}, {'element': 'Ir', 'number': 77, 'mass': 192.217}, {'element': 'Pt', 'number': 78, 'mass': 195.084},
                    {'element': 'Au', 'number': 79, 'mass': 196.967}, {'element': 'Hg', 'number': 80, 'mass': 200.592}, {'element': 'Tl', 'number': 81, 'mass': 204.383},
                    {'element': 'Pb', 'number': 82, 'mass': 207.2}, {'element': 'Bi', 'number': 83, 'mass': 208.98}, {'element': 'Po', 'number': 84, 'mass': 209.0},
                    {'element': 'At', 'number': 85, 'mass': 210.0}, {'element': 'Rn', 'number': 86, 'mass': 222.0}, {'element': 'Fr', 'number': 87, 'mass': 223.0},
                    {'element': 'Ra', 'number': 88, 'mass': 226.0}, {'element': 'Ac', 'number': 89, 'mass': 227.0}, {'element': 'Th', 'number': 90, 'mass': 232.038},
                    {'element': 'Pa', 'number': 91, 'mass': 231.036}, {'element': 'U', 'number': 92, 'mass': 238.029}, {'element': 'Np', 'number': 93, 'mass': 237.048},
                    {'element': 'Pu', 'number': 94, 'mass': 239.052}, {'element': 'Am', 'number': 95, 'mass': 243.0}, {'element': 'Cm', 'number': 96, 'mass': 247.0},
                    {'element': 'Bk', 'number': 97, 'mass': 247.0}, {'element': 'Cf', 'number': 98, 'mass': 251.0}
                ],
                element: '',
                structureFile: null,
                atomHeaders: [{key: 'Atom', title: 'Atom'}, {key: 'X', title: 'X'}, {key: 'Y', title: 'Y'}, {key: 'Z', title: 'Z'}],
                atomData: [],
                atom: 'H',
                atomX: 0,
                atomY: 0,
                atomZ: 0,
                isSubmitDisabled: true,
                clusterStatus: '',
                baseURL: 'http://172.23.169.32/',
                form: '',
                jobData: [],


                // ORCA
                orcaDisplay: 'inline',
                technique: '',
                functional: '',
                basis: '',
                charge: 0,
                multiplicity: 1,
                solvent: '',

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
                orbWin0Start: 0,
                orbWin0Stop: 0,
                orbWin1Start: 0,
                orbWin1Stop: 0,


                // FDMNES
                fdmnesDisplay: 'none',
                fdmnes_result_file: 'result',
                fdmnes_abs_edge: ['K',
                         'L1', 'L2', 'L3',
                         'M1', 'M2', 'M3', 'M4', 'M5',
                ],
                fdmnes_method: '',
                fdmnes_edge: '',
                crystal: '',
                fdmnesParameterHeaders: [{key: 'A', title: 'A'}, {key: 'B', title: 'B'}, {key: 'C', title: 'C'}, {key: 'Alpha', title: 'Alpha'}, {key: 'Beta', title: 'Beta'}, {key: 'Gamma', title: 'Gamma'}],
                fdmnesParams: [{A: 0, B: 0, C: 0, Alpha: 90, Beta: 90, Gamma: 90}],


                // QUANTUM ESPRESSO
                // Control
                quantumEspressoDisplay: 'none',
                card: 'control',
                title: '',
                calculation: 'scf',
                verbosity: 'low',
                restart_mode: 'from_scratch',
                nstep: 0,
                forces: '',
                etot_conv_thr: '',
                prefix: '',

                // System
                nat: 1,
                ntyp: 1,
                ecutwfc: 0,
                ibrav: 0,
                occupations: '',
                smearing: '',
                degauss: '',

                // Electrons
                disagonalization: '',
                electron_maxstep: 0,
                mixing_beta: '',

                // Atomic_Species
                qePseudos: [],
                psudoFile: null,

                // Atomic_Position
                atomicPositionType: '',

                // Cell_Parameters
                cellParamsType: '',
                cellParamData: [
                    { ID: 1, X: 0, Y: 0, Z: 0 },
                    { ID: 2, X: 0, Y: 0, Z: 0 },
                    { ID: 3, X: 0, Y: 0, Z: 0 }
                ],
                // Can use decimal:5 to limit 5 decimal places
                atomRules: '',
                orcaAtomRules: 'required|decimal|min_value:-100|max_value:100',
                fdmnesAtomRules: 'required|decimal|min_value:-1|max_value:1'
            }
        },

        created: function(){
            this.startCluster()

            // orca
            this.functional = 'BLYP'
            this.basis = 'def2-SVP'
            this.solvent = this.orca_solvents[0]['name']
            this.technique = 'Xas'
            this.atomRules = this.orcaAtomRules
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

        mounted: function(){
            this.$refs.orcaTabButton.classList.add('active')
            this.$refs.controlCardBtn.classList.add('active')
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

                                setInterval(function(){
                                    self.getJobStatus()
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

            getJobStatus: function(){
                let self = this
                Backbone.ajax({
                    url: self.baseURL + "list_jobs",
                    data: {
                        login: app.user
                    },
                    method: 'GET',
                    success: function(response){
                        self.jobData = JSON.parse(response)
                    },
                    error: function(response){
                        console.log('Unsable to get job status ' + response)
                    }
                })
            },

            tabDisplay: function(event){
                var name = event.target.name

                this.$refs.inputFile.value = ''
                this.$refs.orcaStructureFile.value = ''
                this.$refs.fdmnesStructureFile.value = ''

                this.$refs.orcaTabButton.classList.remove('active')
                this.$refs.fdmnesTabButton.classList.remove('active')
                this.$refs.quantumEspressoTabButton.classList.remove('active')
                this.$refs[name].classList.add('active')

                this.atomData = []
                
                // We could use the card logic here, but the input file clearing above will need refactoring too
                // With v-if == false the section is not rendered to the DOM at all so we get undefined var errors
                switch(name){
                    case "orcaTabButton":
                        this.orcaDisplay = 'inline'
                        this.fdmnesDisplay = 'none'
                        this.quantumEspressoDisplay = 'none'
                        this.atomRules = this.orcaAtomRules
                        this.form = 'orca'
                        break
                    case "fdmnesTabButton":
                        this.orcaDisplay = 'none'
                        this.fdmnesDisplay = 'inline'
                        this.quantumEspressoDisplay = 'none'
                        this.atomRules = this.fdmnesAtomRules
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
             * May need to switch this to use the tab display method instead
             * to sort out some v-validate issues when elements are re-rendered
             */
            cardDisplay: function(event){
                var name = event.target.name

                this.$refs.controlCardBtn.classList.remove('active')
                this.$refs.systemCardBtn.classList.remove('active')
                this.$refs.electronsCardBtn.classList.remove('active')
                this.$refs.atomicSpeciesCardBtn.classList.remove('active')
                this.$refs.atomicPositionCardBtn.classList.remove('active')
                this.$refs.cellParamsCardBtn.classList.remove('active')
                this.$refs[name].classList.add('active')

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
                    case "atomicPositionCardBtn":
                        this.card = 'position'
                        break
                    case "cellParamsCardBtn":
                        this.card = 'cellParams'
                        break
                    default:
                        this.card = 'control'
                        break
                }
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

            // Build Orca overview file/string based on form inputs or files uploaded
            orcaOverviewBuilder: function(event){
                if (this.technique == 'Xas') {
                    this.output = '! ' + this.functional + ' DKH2 ' + this.basis + ' def2/J '

                    if (this.solvent != 'None') {
                        this.output += 'CPCM(' + this.solvent + ') '
                    }

                    this.output += 'SlowConv NoFinalGrid' + "\n"
                    this.output += '%maxcore 5024' + "\n\n"
                    this.output += '%pal nprocs ' + this.cpus + "\n"
                    this.output += 'end' + "\n\n"
                    this.output += '%tddft' + "\n"

                    if(this.technique == 'Xas'){
                        this.output += 'orbWin[0] = ' + this.orbWin0Start + ',' + this.orbWin0Stop + ',-1,-1' + "\n"
                        this.output += 'orbWin[1] = ' + this.orbWin1Start + ',' + this.orbWin1Stop + ',-1,-1' + "\n"
                    }

                    this.output += 'doquad true' + "\n"
                    this.output += 'nroots 20' + "\n"
                    this.output += 'maxdim 10' + "\n"
                    this.output += 'end' + "\n\n"
                }
                else if (this.technique == 'Xes') {
                    this.output = '! UKS ' + this.functional + ' DKH2 ' + this.basis + ' def2/J '

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

                if (event && event.target.files[0]) {
                    var structureFileName = event.target.files[0].name

                    if(structureFileName.endsWith('.xyz')){
                        this.output += "* xyzfile " + this.charge + " " + this.multiplicity + " " + structureFileName + "\n"
                    }
                    else if(structureFileName.endsWith('.gzmt')){
                        this.output += "* gzmtfile " + this.charge + " " + this.multiplicity + " " + structureFileName + "\n"
                    }
                    else {
                        console.log(structureFileName)
                        app.alert({title: 'error', message: 'Orca structure file must be .xyz or .gmnt'})
                        this.$refs.fdmnesStructureFile.value = ''
                        this.$refs.orcaStructureFile.value = ''
                    }
                } else {
                    this.output += '*xyz ' + this.charge + ' ' + this.multiplicity + "\n"
                }

                for(var i=0; i<this.atomData.length; i++){
                    this.output += this.atomData[i].Atom + ' ' + this.atomData[i].X + ' ' + this.atomData[i].Y + ' ' + this.atomData[i].Z + "\n"
                }

                if(!this.structureFile){
                    this.output += "*"
                }

                this.inputFileContents = this.output
                this.resizeOverview()
            },

            // Build Fdmnes overview file/string based on form inputs or files uploaded
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
                        this.output += 'Cif_file (or Film_Cif_file, when working with a 2D film)' + "\n"
                        this.output += structureFileName
                    }
                    else if(structureFileName.endsWith('.pdb')){
                        this.output += 'Pdb_file (or Film_Pdb_file, when working with a 2D film)' + "\n"
                        this.output += structureFileName
                    }
                    else {
                        app.alert({title: 'error', message: 'Structure file must be .cif or .pdb'})
                        this.$refs.fdmnesStructureFile.value = ''
                        this.$refs.orcaStructureFile.value = ''
                    }
                    ready = true
                } else {
                    if(this.crystal == 'Crystal')
                        this.output += 'Crystal' + '        ! Periodic material description (unit cell)' + "\n"
                    else if(this.crystal == 'Molecule')
                        this.output += 'Molecule' + '       ! Periodic or cylindrical or spherical coordinates' + "\n"

                    this.output += this.fdmnesParams[0].A + " " + this.fdmnesParams[0].B + " " + this.fdmnesParams[0].C + " " + this.fdmnesParams[0].Alpha + " " + this.fdmnesParams[0].Beta + " " + this.fdmnesParams[0].Gamma + "     ! a, b, c, alpha, beta, gamma\n"

                    this.atomData.forEach(function(item, index){
                        for(var i=0; i<self.elements.length; i++){
                            if(item["Atom"] == self.elements[i]['element']){
                                self.output += self.elements[i]['number'] + " " + item.X + " " + item.Y + " " + item.Z + "     ! Atomic Number, Position\n"
                            }
                        }
                    })

                    ready = true
                }

            },

            // Build Quantum Espresso overview file/string based on form inputs or files uploaded
            quantumEspressoOverviewBuilder: function(event){
                let self = this

                this.output = "&CONTROL \n"
                this.output += " calculation = \'" + this.calculation + "\'\n"
                this.output += " etot_conv_thr = " + this.etot_conv_thr + "\n"
                this.output += " nstep = " + this.nstep + "\n"
                this.output += " outdir = \'.\/\' \n"
                this.output += " prefix = \'" + this.prefix + "\' \n"
                this.output += " pseudo_dir = \'.\/\' \n"
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
                this.output += " nat = " + this.nat + "\n"
                this.output += " ntyp = " + this.ntyp + "\n"
                this.output += " ecutwfc = " + this.ecutwfc + "\n"
                this.output += "/ \n\n"

                this.output += "&ELECTRONS \n"
                this.output += " diagonalization = \'" + this.disagonalization + "\'\n"
                this.output += " electron_maxstep = " + this.electron_maxstep + "\n"
                this.output += " mixing_beta = " + this.mixing_beta + "\n"
                this.output += "/ \n\n"

                this.output += "ATOMIC_SPECIES \n"

                this.qePseudos.forEach(function(item, index){
                    self.output += item.Element + " " + item.mass + " " + item.Filename + "\n"
                })
                this.output += "\n\n"

                this.output += "ATOMIC_POSITIONS { " + this.atomicPositionType + " }\n"

                this.atomData.forEach(function(item, index){
                    console.log(item)
                    self.output += item.Atom + " " + item.X + " " + item.Y + " " + item.Z + "\n"
                })
                this.output += "\n\n"

                this.output += "K_POINTS gamma\n"
                this.output += "\n\n"

                this.output += "CELL_PARAMETERS { " + this.cellParamsType + " }\n"

                this.cellParamData.forEach(function(item, index){
                    self.output += " " + item.X + " " + item.Y + " " + item.Z + "\n"
                })


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
                        this.structureFile = null
                        this.$refs.orcaStructureFile.value = ''
                        this.$refs.fdmnesStructureFile.value = ''
                        break
                }
                this.overviewBuilder()
            },

            setPseudoFile: function(event){
                this.pseudoFile = event.target.files[0]
            },

            addPseudo: function(){
                if(!this.pseudoFile || !this.atom){
                    app.alert({title: 'error', message: 'You must select an element and pseudopotential file!'})
                    return
                }

                for(var i=0; i<this.elements.length; i++){
                    if(this.atom == this.elements[i]['element']){

                        let newPseudo = {
                            ID: this.qePseudos.length,
                            Element: this.atom,
                            mass: this.elements[i]['mass'],
                            Filename: this.pseudoFile.name,
                            file: this.pseudoFile
                        }

                        this.qePseudos[this.qePseudos.length] = newPseudo

                        this.atom = '' //UI isn't great when resetting
                        this.pseudoFile = null
                        this.$refs.pseudoFile.value = ''
                        break
                    }
                }
                this.overviewBuilder()
            },

            removePseudo: function(pseudoID){
                var pseudoIndex
                for(var i = 0; i< this.qePseudos.length; i++){
                    if(this.qePseudos[i].ID == pseudoID){
                        pseudoIndex = i
                        break
                    }
                }
                this.qePseudos.splice(pseudoIndex, 1)
            },

            onSubmit: function(e){
                this.isLoading = true
                e.preventDefault()
                let self = this

                this.$validator.validateAll().then(function(result){
                    if(result && self.inputFileContents != ''){

                        let data = {
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
                        }

                        let formData = new FormData()

                        // Add data
                        for(var key in data){
                            formData.append(key, data[key])
                        }

                        // Add structure file
                        if(self.$refs.orcaStructureFile.value){
                            console.log(self.$refs.orcaStructureFile.value)
                            formData.append('orcaStructureFile', self.structureFile)
                        } else if (self.$refs.fdmnesStructureFile.value) {
                            console.log(self.$refs.fdmnesStructureFile.value)
                            formData.append('fdmnesStructureFile', self.structureFile)
                        }

                        // Add pseudo files
                        self.qePseudos.forEach(function(item, index){
                            formData.append(item.Filename, item.file)
                        })

                        Backbone.ajax({
                            url: self.baseURL + 'upload_' + self.form,
                            data: formData,
                            method: 'POST',
                            // Required to allow split content type between file/data
                            // Stops AJAX setting it's preferred defaults
                            contentType: false,
                            processData: false,

                            success: function(response) {
                                self.isLoading = false
                                console.log('success!' + response)
                                app.alert({className: 'message notify', message: "Successfully submitted conexs file contents!"})
                                
                            },
                            error: function(response) {
                                self.isLoading = false
                                app.alert({ title: 'Error', message: response })
                            },
                        })
                    } else {
                        this.isLoading = false
                        app.alert({ title: 'Error', message: 'No file provided, or the selected file is empty!'})
                    }
                })
            },

            addAtom: function(){
                var newAtom
                if(this.atom){
                    newAtom = {
                        ID: this.atomData.length,
                        Atom: this.atom,
                        X: this.atomX,
                        Y: this.atomY,
                        Z: this.atomZ
                    }
                    this.atomData[this.atomData.length] = newAtom

                    this.atom = ''
                    this.atomX = 0
                    this.atomY = 0
                    this.atomZ = 0
                } else {
                    app.alert({title: 'Error', message: "Invalid atom data!"})
                }
            },

            removeAtom: function(atomID){
                var atomIndex
                for(var i = 0; i< this.atomData.length; i++){
                    if(this.atomData[i].ID == atomID){
                        atomIndex = i
                        break
                    }
                }
                this.atomData.splice(atomIndex, 1)
            },

            setStructureFile: function(event){
                this.structureFile = event.target.files[0]
            },

            killJob: function(jobID){
                console.log('kill job pressed for jobId: ' + jobID)
                this.$refs['job'+jobID].disabled = true
                
                let self = this
                Backbone.ajax({
                    url: self.baseURL + "kill_job",
                    data: {
                        login: app.user,
                        jobId: jobID
                    },
                    method: 'POST',
                    success: function(response){
                        console.log('Job successfully killed')
                        if(self.jobData.length){
                            self.jobData.forEach(function(item, index){
                                if(item.jobID == jobID){
                                    item.jobStatus = 'Killed'
                                }
                            })
                        }
                    },
                    error: function(response){
                        this.$refs['job'+jobID].disabled = false
                        console.log('failed to kill job')
                        app.alert({ title: 'Error', message: 'Failed to kill job, please try again later'})
                    }
                })
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
    button.active {
        background-color: #cccccc;
    }
</style>