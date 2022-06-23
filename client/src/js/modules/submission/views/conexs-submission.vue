<template>
    <div>
        <button name="orcaTabButton" ref="orcaTabButton" class="button" v-on:click="tabDisplay($event)">ORCA</button>
        <button name="fdmnesTabButton" ref="fdmnesTabButton" class="button" v-on:click="tabDisplay($event)">FDMNES</button>
        <button name="quantumEspressoTabButton" ref="quantumEspressoTabButton" class="button" v-on:click="tabDisplay($event)">Quantum Espresso</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span>Cluster status: {{ clusterStatus }}</span>&nbsp;&nbsp;&nbsp;<i v-if="clusterStatus != 'Running' && clusterStatus != 'Sleeping' && clusterStatus != 'Unavailable'" class="fa icon grey fa-cog fa-spin"></i>
        <br />
        <br />
        <form v-on:submit.prevent="onSubmit" method="post" id="submit-orca" v-bind:class="{loading: isLoading}">
            <br />
            <label class="left">Input file already exists (*.inp)?</label>
            <input type="file" ref="inputFile" v-on:change="setInputFile($event)"/>
            <button type="button" ref="clearInputFile" name="clearInputFile" class="button" v-on:click="clearFile($event)">Clear </button>
            <br /><br />
            <div v-if="form != 'orca'">
                <label v-if="form == 'fdmnes'" class="left">Element:</label>
                <select v-if="form == 'fdmnes'" name="element" v-model="element" v-on:change="overviewBuilder()">
                    <option v-for="e in elements">{{ e['element'] }}</option>
                </select>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                <label class="notLeft">Absorption edge:</label>
                <select name="absorbEdge" v-if="form == 'fdmnes'" v-model="edge" v-on:change="overviewBuilder()">
                    <option v-for="edge in fdmnes_abs_edge">{{ edge }}</option>
                </select>
                <select name="absorbEdge" v-if="form == 'qe'" v-model="edge" v-on:change="overviewBuilder()">
                    <option v-for="edge in qe_abs_edge">{{ edge }}</option>
                </select>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <section id="orcaTab" v-bind:style="{display: orcaDisplay}">
                <div style="float:right; width:40%; height:30%">
                    <p>ORCA is an ab initio, DFT, and semi-empirical SCF-MO package developed by Frank Neese et al. at the Max Planck Institut für Kohlenforschung.</p>
                    <br/>

                    <span>ORCA webpage at Max-Planck-Institut: <a href="https://www.kofo.mpg.de/en/research/services/orca">https://www.kofo.mpg.de/en/research/services/orca</a></span>
                    <br/>
                    <span>ORCA manual: <a href="https://www.kofo.mpg.de/412442/orca_manual-opt.pdf">https://www.kofo.mpg.de/412442/orca_manual-opt.pdf</a></span>
                    <br/>
                    <span>ORCA input library website: <a href="https://sites.google.com/site/orcainputlibrary/home">https://sites.google.com/site/orcainputlibrary/home</a></span>
                    <br/><br/>

                    <p>
                        In general, the input file is a free format ASCII file and can contain one or more keyword lines that start with a
                        "!" sign, one or more input blocks enclosed between an "%" sign and "end" that provide finer control over specific
                        aspects of the calculation, and finally the specification of the coordinates for the system along with the charge and
                        multiplicity provided either with a %coords block, or more usually enclosed within two "*" symbols. Here is an
                        example of a simple input file that contains all three input elements:
                    </p>
                    <br/>

                    <p>! BLYP DKH2 def2-SVP def2/J SlowConv NoFinalGrid # This is a comment</p>
                    <br/>

                    <p>%maxcore 5024 # global scratch memory limit (in MB) per processing core.</p>
                    <br />

                    <p>%pal nprocs 4 # requested number of CPUs</p>
                    <span>end</span>
                    <br/><br/>

                    <span>* xyz 0 1</span>
                    <br/>
                    <span>C &nbsp; 0.0 &nbsp; 0.0 &nbsp; 0.0</span>
                    <br/>
                    <span>O &nbsp; 0.0 &nbsp; 0.0 &nbsp; 1.13</span>
                    <br/>
                    <span>*</span>
                    <br/><br/>

                    <p>
                        The input may contain several blocks, which consist of logically related data that can be user controlled. The program tries to choose sensible default values for all of these variables.
                        However, it is impossible to give defaults that are equally sensible for all systems. In general the defaults are slightly on the conservative side and more aggressive cutoffs etc. can
                        be chosen by the user and may help to speed things up for actual systems or give higher accuracy if desired. One-liner explanation (starts with !, order of the keywords is not important)
                    </p>
                    <br />

                    <p>!Keywords Functional Hamiltonian BasisSet AuxBasisSet</p>
                    <br />

                    <p>BLYP &nbsp; - generalized gradient approximation (GGA) DFT functional; see Table 6.2: Density functionals available in ORCA.</p>
                    <p>DKH2 &nbsp; - scalar relativistic Douglas-Kroll-Hess Hamiltonian of 2nd order; see Table 6.2: Density functionals available in ORCA.</p>
                    <p>def2-SVP &nbsp; - basis set for H-Rn; see Table 9.8: Basis sets availability.</p>
                    <p>def2/J &nbsp; - Coulomb-fitting auxiliary basis sets (AuxJ); see Table 9.8: Basis sets availability.</p>
                    <p>UKS &nbsp; - selects spin unrestricted SCF method; Table 6.1: Main keywords that can be used in the simple input of ORCA.</p>
                    <p>RKS &nbsp; - selects restricted closed-shell SCF method.</p>
                    <p>SlowConv &nbsp; - selects appropriate SCF converger criteria for difficult cases. Most transition metal complexes fall into this category.</p>
                    <p>NoFinalGrid &nbsp; - turns the final integration grid feature off.</p>
                    <br />


                    <p>Reading geometry from file.xyz in XMol format with coordinates in Ångström and a 2-line header that contains the number of atoms and a description line:</p>
                    <br/>

                    <p>4</p>
                    <p>description line</p>
                    <p>C &nbsp; 0.000000000 &nbsp; 0.000000000 &nbsp; 0.000000000</p>
                    <p>O &nbsp; 2.362157486 &nbsp; 0.000000000 &nbsp; 0.000000000</p>
                    <p>H &nbsp; -1.109548835 &nbsp; 1.774545300 &nbsp; 0.000000000</p>
                    <p>H &nbsp; -1.109548835 &nbsp; -1.774545300 &nbsp; 0.000000000</p>
                    <br/>
                </div>
                <ul>
                    <li>
                        <label class="left" >Which technique?</label>
                        <input type="radio" id="Xas" name="technique" value="Xas" checked="checked" v-model="technique" v-on:change="overviewBuilder()">
                        <label class="notLeft" style="margin-left:5px" for="Xas">XAS</label>
                        &nbsp;&nbsp;&nbsp;
                        <input type="radio" id="Xes" name="technique" value="Xes" v-model="technique" v-on:change="overviewBuilder()">
                        <label class="notLeft" style="margin-left:5px" for="Xes">XES</label>
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
                        <label class="left">Load structure (.xyz, .gmnt):</label>
                        <input type="file" ref="orcaStructureFile" v-on:change="setStructureFile($event); overviewBuilder($event)" title="Use file for structure (must be in correct format) or manually add structure using Atoms"/>
                        <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                    </li>
                </ul>
            </section>

            <section id="fdmnesTab" v-bind:style="{display: fdmnesDisplay}">
                <div style="float:right; width:40%; height:30%">
                    <span><a href="http://fdmnes.neel.cnrs.fr/">http://fdmnes.neel.cnrs.fr/</a></span>

                    <p>FDMNES, for Finite Difference Method Near Edge Structure, uses the density functional theory (DFT). It is thus specially devoted to the simulation of the K edges of all the chemical elements and of the L23 edges of the heavy ones.</p>
                </div>
                <br />
                <ul>
                    <li>
                        <label class="left">Green?</label>
                        <input type="checkbox" v-model="fdmnes_method" v-on:change="overviewBuilder()" />

                        <label class="notLeft">Crystal?</label>
                        <select name="crystal" v-model="crystal" v-on:change="overviewBuilder()">
                            <option>Crystal</option>
                            <option>Molecule</option>
                        </select>
                    </li>
                    <li>
                        <label class="left">Load structure (.cif, .pdb):</label>
                        <input type="file" ref="fdmnesStructureFile" v-on:change="setStructureFile($event); overviewBuilder($event)"/>
                        <button type="button" ref="clearStructureFile" name="clearStructureFile" class="button" v-on:click="clearFile($event)">Clear</button>
                    </li>
                </ul>
            </section>

            <section id="quantumEspressoTab" v-bind:style="{display: quantumEspressoDisplay}">
                <div style="float:right; width:40%; height:30%">
                    <span><a href="https://www.quantum-espresso.org/">https://www.quantum-espresso.org/</a></span>

                    <p>Quantum ESPRESSO is an integrated suite of Open-Source computer codes for electronic-structure calculations and materials modeling at the nanoscale. It is based on density-functional theory, plane waves, and pseudopotentials.</p>
                </div>
                <br />
                <br /><br />
                <label>Cards</label>
                <br /><br />
                <button type="button" name="systemCardBtn" ref="systemCardBtn" class="button" v-on:click="cardDisplay($event)">SYSTEM</button>
                <button type="button" name="atomicPositionCardBtn" ref="atomicPositionCardBtn" class="button" v-on:click="cardDisplay($event)">ATOMIC_POSITION</button>
                <button type="button" name="cellParamsCardBtn" ref="cellParamsCardBtn" class="button" v-on:click="cardDisplay($event)">CELL_PARAMETERS</button>
                <button type="button" name="mpApiBtn" ref="mpApiBtn" class="button" v-on:click="cardDisplay($event)">MATERIAL_PROJECT</button>

                <br /><br />

                <section id="systemCard" name="systemCard" v-if="card == 'system' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Conductivity:</label>
                            <select name="conductivity" v-model="conductivity" v-on:change="overviewBuilder()">
                                <option>metallic</option>
                                <option>semiconductor</option>
                                <option>insulator</option>
                            </select>
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
                                :headers="qeAtomHeaders"
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
                                            <option v-for="e in ppElements">{{ e['element'] }}</option>
                                        </select>
                                    </td>
                                    <td><input type="text" v-model="atomX" name="atomX" v-bind:class="{ferror: errors.has('atomX')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><input type="text" v-model="atomY" name="atomY" v-bind:class="{ferror: errors.has('atomY')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><input type="text" v-model="atomZ" name="atomZ" v-bind:class="{ferror: errors.has('atomZ')}" v-validate="'required|decimal|min_value:-100|max_value:100'"/></td>
                                    <td><input type="checkbox" title="Only one atom can be marked as absorbing" v-model="absorbingAtom" :disabled="absorbingAtomDisabled"/></td>
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
                <section id="mpApiCard" name="mpApiCard" v-if="card =='mpApi' && quantumEspressoDisplay == 'inline'">
                    <ul>
                        <li>
                            <label class="left">Your personal MP token:</label>
                            <input style="width: 30%" type="text" v-model="mpApiToken" name="mpApiToken"/>
                        </li>
                        <li>
                            <label class="left">Material ID (e.g., mp-100):</label>
                            <input style="width: 30%" type="text" v-model="mpApiId" name="mpApiId"/>
                        </li>
                        <li>
                            <label class="left">Which atom is absorbing (counting from 1)?:</label>
                            <input type="number" min="1" max="100" v-model="mpApiAtom" name="mpApiAtom"/>
                        </li>
                        <li>
                            <button type="button" ref="fetchMpapiInput" name="fetchMpapiInput" class="button" v-on:click="fetchMpApi($event)">Fetch from MP api</button>
                        </li>
                    </ul>
                </section>
            </section>

            <ul>
                <!-- This gets pushed out of alignment because li tags inside a form are considered flex containers. This means the helper text floating right is in the way and pushes it out
                    We can fix it by adding display: block but the same will happen to other elements if the page is resized. -->
                <li>
                    <label v-if="quantumEspressoDisplay != 'inline'" class="left">Atoms:</label>
                    <table-component
                        :headers="atomHeaders"
                        :data="atomData"
                        actions="Actions"
                        addRow="addRow"
                        v-if="orcaDisplay == 'inline' || fdmnesDisplay == 'inline'"
                        title="Define system structure as atom and position (Angstrom)"
                        style="padding-bottom: 0px"
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

                <li v-if="fdmnesDisplay == 'inline'">
                    <label class="left">Params:</label>
                    <table-component
                        :headers="fdmnesParameterHeaders"
                        :data="fdmnesParams"
                        style="padding-bottom: 0px"
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
                    <label class="left">Overview (cannot edit!):</label>
                    <textarea id="fileContents" v-bind:value="inputFileContents" v-bind:rows="textAreaRows" v-bind:cols="textAreaColumns" style="width:auto;height:auto" title="Job overview to be submitted to the calculation cluster" readonly>
                    </textarea>
                </li>

                <li>
                    <label class="left">Save input file:</label>
                    <button type="button" class="button" v-on:click="downloadFileContents()">Download</button>
                </li>
                <li v-if="orcaDisplay == 'inline'">
                    <label class="left">Spectrum Type:</label>
                    <select name="orcaSpectrumType" v-model="orcaSpectrumType">
                        <option v-for="s in orcaMapKeyword">{{ s }}</option>
                    </select>
                    <label class="notLeft">Start Value (eV):</label>
                    &nbsp;
                    <input type="text" name="orcaStartValue" v-model="orcaStartValue" v-bind:class="{ferror: errors.has('orcaStartValue')}" v-validate="'required|decimal'">
                    &nbsp;
                    <label class="notLeft">Stop Value (eV):</label>
                    &nbsp;
                    <input type="text" name="orcaStopValue" v-model="orcaStopValue" v-bind:class="{ferror: errors.has('orcaStopValue')}" v-validate="'required|decimal'">
                    &nbsp;
                    <label class="notLeft">Broadening (eV):</label>
                    &nbsp;
                    <input type="text" name="orcaBroadening" v-model="orcaBroadening" v-bind:class="{ferror: errors.has('orcaBroadening')}" v-validate="'required|decimal|min_value:0|max_value:100'">
                </li>
                <li v-if="orcaDisplay == 'inline'">
                    <input type="checkbox" name="orcaLicense" value="accepted" v-model="orcaLicense">
                    &nbsp;
                    <label class="notleft" style="font-size:14px; color:red">  Please tick here to comply with ORCA license agreement <a href="https://orcaforum.kofo.mpg.de/app.php/privacypolicy/policy">https://orcaforum.kofo.mpg.de/app.php/privacypolicy/policy</a></label>
                    <!-- <label v-if="orcaLicense" class="left">Thanks!</label> -->
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </li>
                <!-- Here vertical align does not really work -->
                <li style="vertical-align:middle; position: relative;">
                    <label class="left">CPUs: </label>
                    <input type="text" name="cpus" v-model="cpus" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('cpus')}" v-validate="'required|numeric|min_value:1|max_value:10'"/>
                    <span v-if="errors.has('cpus')" class="errormessage ferror">{{ errors.first('cpus') }}</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <label class="notLeft">Memory required in Gb:</label>
                    <input type="text" name="memory" v-model="memory" v-on:change="overviewBuilder()" v-bind:class="{ferror: errors.has('memory')}" v-validate="'required|numeric|min_value:1|max_value:32'"/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span v-if="errors.has('memory')" class="errormessage ferror">{{ errors.first('memory') }}</span>
                    <button type="button" class="button submit" name="orcaSubmit" v-on:click="onSubmit($event)" :disabled="isSubmitDisabled || (!orcaLicense && orcaDisplay=='inline')">SUBMIT</button>
                </li>
                <li>
                    <span style="font-size:13px">On successful submission, your results will be sent to the e-mail address associated with your fedid</span>
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
                    {'element': 'H', 'number': 1, 'mass': 1.0078, 'pseudopotential': 'H.pbe-rrkjus_gipaw.UPF'}, {'element': 'He', 'number': 2, 'mass': 4.0026, 'pseudopotential': 'He.pbe-rrkjus_gipaw.UPF'}, {'element': 'Li', 'number': 3, 'mass': 6.94, 'pseudopotential': 'Li.pbe-s-rrkjus_gipaw.UPF'},
                    {'element': 'Be', 'number': 4, 'mass': 9.0122, 'pseudopotential': 'Be.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'B', 'number': 5, 'mass': 10.81, 'pseudopotential': 'B.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'C', 'number': 6, 'mass': 12.011, 'pseudopotential': 'C.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'N', 'number': 7, 'mass': 14.007, 'pseudopotential': 'N.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'O', 'number': 8, 'mass': 15.999, 'pseudopotential': 'O.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'F', 'number': 9, 'mass': 18.9984, 'pseudopotential': 'F.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'Ne', 'number': 10, 'mass': 20.1797, 'pseudopotential': 'Ne.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Na', 'number': 11, 'mass': 22.9898, 'pseudopotential': 'Na.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Mg', 'number': 12, 'mass': 24.305, 'pseudopotential': 'Mg.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Al', 'number': 13, 'mass': 26.9815, 'pseudopotential': 'Al.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Si', 'number': 14, 'mass': 28.085, 'pseudopotential': 'Si.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'P', 'number': 15, 'mass': 30.9738, 'pseudopotential': 'P.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'S', 'number': 16, 'mass': 32.06, 'pseudopotential': 'S.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Cl', 'number': 17, 'mass': 35.453, 'pseudopotential': 'Cl.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Ar', 'number': 18, 'mass': 39.948, 'pseudopotential': 'Ar.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'K', 'number': 19, 'mass': 39.0983, 'pseudopotential': 'K.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Ca', 'number': 20, 'mass': 40.078, 'pseudopotential': 'Ca.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Sc', 'number': 21, 'mass': 44.9559, 'pseudopotential': 'Sc.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Ti', 'number': 22, 'mass': 47.867, 'pseudopotential': 'Ti.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'V', 'number': 23, 'mass': 50.9415, 'pseudopotential': 'V.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Cr', 'number': 24, 'mass': 51.996, 'pseudopotential': 'Cr.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Mn', 'number': 25, 'mass': 54.938, 'pseudopotential': 'Mn.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Fe', 'number': 26, 'mass': 55.845, 'pseudopotential': 'Fe.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Co', 'number': 27, 'mass': 58.9332, 'pseudopotential': 'Co.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'Ni', 'number': 28, 'mass': 58.6934, 'pseudopotential': 'Ni.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Cu', 'number': 29, 'mass': 63.546, 'pseudopotential': 'Cu.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Zn', 'number': 30, 'mass': 65.38, 'pseudopotential': 'Zn.pbe-dn-rrkjus_gipaw.UPF'},
                    {'element': 'Ga', 'number': 31, 'mass': 69.72, 'pseudopotential': 'Ga.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Ge', 'number': 32, 'mass': 72.63, 'pseudopotential': 'Ge.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'As', 'number': 33, 'mass': 74.9216, 'pseudopotential': 'As.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'Se', 'number': 34, 'mass': 78.971, 'pseudopotential': 'Se.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Br', 'number': 35, 'mass': 79.904, 'pseudopotential': 'Br.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Kr', 'number': 36, 'mass': 83.798, 'pseudopotential': 'Kr.pbe-dn-rrkjus_gipaw.UPF'},
                    {'element': 'Rb', 'number': 37, 'mass': 85.4678, 'pseudopotential': 'Rb.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Sr', 'number': 38, 'mass': 87.62, 'pseudopotential': 'Sr.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Y', 'number': 39, 'mass': 88.9058, 'pseudopotential': 'Y.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Zr', 'number': 40, 'mass': 91.224, 'pseudopotential': 'Zr.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Nb', 'number': 41, 'mass': 92.9064, 'pseudopotential': 'Nb.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Mo', 'number': 42, 'mass': 95.95, 'pseudopotential': 'Mo.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Tc', 'number': 43, 'mass': 97.907, 'pseudopotential': 'Tc.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Ru', 'number': 44, 'mass': 101.07, 'pseudopotential': 'Ru.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Rh', 'number': 45, 'mass': 102.906, 'pseudopotential': 'Rh.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Pd', 'number': 46, 'mass': 106.42, 'pseudopotential': 'Pd.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Ag', 'number': 47, 'mass': 107.868, 'pseudopotential': 'Ag.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Cd', 'number': 48, 'mass': 112.414, 'pseudopotential': 'Cd.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'In', 'number': 49, 'mass': 114.818, 'pseudopotential': 'In.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Sn', 'number': 50, 'mass': 118.71, 'pseudopotential': 'Sn.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Sb', 'number': 51, 'mass': 121.76, 'pseudopotential': 'Sb.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'Te', 'number': 52, 'mass': 127.6, 'pseudopotential': 'Te.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'I', 'number': 53, 'mass': 126.905, 'pseudopotential': 'I.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Xe', 'number': 54, 'mass': 131.293, 'pseudopotential': 'Xe.pbe-dn-rrkjus_gipaw.UPF'},
                    {'element': 'Cs', 'number': 55, 'mass': 132.905, 'pseudopotential': 'Cs.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Ba', 'number': 56, 'mass': 137.327, 'pseudopotential': 'Ba.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'La', 'number': 57, 'mass': 138.905, 'pseudopotential': 'La.pbe-spfn-rrkjus_gipaw.UPF'},
                    {'element': 'Ce', 'number': 58, 'mass': 140.116, 'pseudopotential': 'Ce.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Pr', 'number': 59, 'mass': 140.908, 'pseudopotential': 'Pr.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Nd', 'number': 60, 'mass': 144.242, 'pseudopotential': 'Nd.pbe-spdn-rrkjus_gipaw.UPF'},
                    {'element': 'Pm', 'number': 61, 'mass': 145.0, 'pseudopotential': 'Pm.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Sm', 'number': 62, 'mass': 150.36, 'pseudopotential': 'Sm.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Eu', 'number': 63, 'mass': 151.96, 'pseudopotential': 'Eu.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Gd', 'number': 64, 'mass': 157.25, 'pseudopotential': 'Gd.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Tb', 'number': 65, 'mass': 158.925, 'pseudopotential': 'Tb.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Dy', 'number': 66, 'mass': 162.5, 'pseudopotential': 'Dy.pbe-spdn-rrkjus_gipaw.UPF'},
                    {'element': 'Ho', 'number': 67, 'mass': 164.93, 'pseudopotential': 'Ho.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Er', 'number': 68, 'mass': 167.259, 'pseudopotential': 'Er.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Tm', 'number': 69, 'mass': 168.934, 'pseudopotential': 'Tm.pbe-spdn-rrkjus_gipaw.UPF'},
                    {'element': 'Yb', 'number': 70, 'mass': 173.045, 'pseudopotential': 'Yb.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Lu', 'number': 71, 'mass': 174.967, 'pseudopotential': 'Lu.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Hf', 'number': 72, 'mass': 178.49, 'pseudopotential': 'Hf.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Ta', 'number': 73, 'mass': 180.948, 'pseudopotential': 'Ta.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'W', 'number': 74, 'mass': 183.84, 'pseudopotential': 'W.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Re', 'number': 75, 'mass': 186.207, 'pseudopotential': 'Re.pbe-spn-rrkjus_gipaw.UPF'},
                    {'element': 'Os', 'number': 76, 'mass': 190.23, 'pseudopotential': 'Os.pbe-spn-rrkjus_gipaw.UPF'}, {'element': 'Ir', 'number': 77, 'mass': 192.217, 'pseudopotential': 'Ir.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Pt', 'number': 78, 'mass': 195.084, 'pseudopotential': 'Pt.pbe-n-rrkjus_gipaw.UPF'},
                    {'element': 'Au', 'number': 79, 'mass': 196.967, 'pseudopotential': 'Au.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Hg', 'number': 80, 'mass': 200.592, 'pseudopotential': 'Hg.pbe-n-rrkjus_gipaw.UPF'}, {'element': 'Tl', 'number': 81, 'mass': 204.383, 'pseudopotential': 'Tl.pbe-dn-rrkjus_gipaw.UPF'},
                    {'element': 'Pb', 'number': 82, 'mass': 207.2, 'pseudopotential': 'Pb.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Bi', 'number': 83, 'mass': 208.98, 'pseudopotential': 'Bi.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Po', 'number': 84, 'mass': 209.0, 'pseudopotential': 'Po.pbe-dn-rrkjus_gipaw.UPF'},
                    {'element': 'At', 'number': 85, 'mass': 210.0, 'pseudopotential': 'At.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Rn', 'number': 86, 'mass': 222.0, 'pseudopotential': 'Rn.pbe-dn-rrkjus_gipaw.UPF'}, {'element': 'Fr', 'number': 87, 'mass': 223.0, 'pseudopotential': 'Fr.pbe-spdn-rrkjus_gipaw.UPF'},
                    {'element': 'Ra', 'number': 88, 'mass': 226.0, 'pseudopotential': 'Ra.pbe-spdn-rrkjus_gipaw.UPF'}, {'element': 'Ac', 'number': 89, 'mass': 227.0, 'pseudopotential': 'Ac.pbe-spfn-rrkjus_gipaw.UPF'}, {'element': 'Th', 'number': 90, 'mass': 232.038, 'pseudopotential': 'Th.pbe-spfn-rrkjus_gipaw.UPF'},
                    {'element': 'Pa', 'number': 91, 'mass': 231.036, 'pseudopotential': 'Pa.pbe-spfn-rrkjus_gipaw.UPF'}, {'element': 'U', 'number': 92, 'mass': 238.029, 'pseudopotential': 'U.pbe-spfn-rrkjus_gipaw.UPF'}, {'element': 'Np', 'number': 93, 'mass': 237.048, 'pseudopotential': 'Np.pbe-spfn-rrkjus_gipaw.UPF'},
                    {'element': 'Pu', 'number': 94, 'mass': 239.052, 'pseudopotential': 'Pu.pbe-spfn-rrkjus_gipaw.UPF'}, {'element': 'Am', 'number': 95, 'mass': 243.0, 'pseudopotential': 'Am.pbe-spfn-rrkjus_gipaw.UPF'}
                ],
                element: '',
                edge: '',
                structureFile: null,
                atomHeaders: [{key: 'Atom', title: 'Atom'}, {key: 'X', title: 'X'}, {key: 'Y', title: 'Y'}, {key: 'Z', title: 'Z'}],
                atomData: [],
                atom: 'H',
                atomX: 0,
                atomY: 0,
                atomZ: 0,
                isSubmitDisabled: true,
                clusterStatus: '',
                form: '',
                jobData: [],


                // ORCA
                orcaLicense: false,
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
                orcaSpectrumType: '',
                orcaMapKeyword: [
                    "", "ABS", "ABSV", "ABSQ", "ABSOI", "SOCABS", "SOCABSQ", "SOCABSOI", "XES", "XESV", "XESQ",
                    "CD", "IR", "RAMAN", "NRVS", "VDOS", "MCD", "XESOI", "XAS", "XASV", "XASQ", "XASOI", "XESSOC", "XASSOC",
                    "RIXS", "RIXSSOC"
                ],
                orcaStartValue: 0,
                orcaStopValue: 1000,
                orcaBroadening: 1,


                // FDMNES
                fdmnesDisplay: 'none',
                fdmnes_result_file: 'result',
                fdmnes_abs_edge: ['K',
                         'L1', 'L2', 'L3',
                         'M1', 'M2', 'M3', 'M4', 'M5',
                ],
                fdmnes_method: '',
                crystal: '',
                fdmnesParameterHeaders: [{key: 'A', title: 'A'}, {key: 'B', title: 'B'}, {key: 'C', title: 'C'}, {key: 'Alpha', title: 'Alpha'}, {key: 'Beta', title: 'Beta'}, {key: 'Gamma', title: 'Gamma'}],
                fdmnesParams: [{A: 0, B: 0, C: 0, Alpha: 90, Beta: 90, Gamma: 90}],


                // QUANTUM ESPRESSO
                qe_abs_edge: ['K', 'L1', 'L2', 'L23'],

                // Control
                quantumEspressoDisplay: 'none',
                card: 'system',
                title: '',
                calculation: 'scf',
                verbosity: 'low',
                restart_mode: 'from_scratch',
                forces: '',
                etot_conv_thr: '1.0000000000d-05',
                prefix: '',
                forc_conv_thr: '1.0000000000d-04',

                // System
                nat: 0,
                ntyp: 0,
                ecutwfc: 50,
                ibrav: 0,
                conductivity: 'metallic',
                occupations: '',
                smearing: '',
                degauss: '',
                electronCount: 0,

                // Electrons
                disagonalization: 'david',
                electron_maxstep: 50,
                mixing_beta: 0.2,

                // Atomic_Position
                atomicPositionType: '',
                qeAtomHeaders: [{key: 'Atom', title: 'Atom'}, {key: 'X', title: 'X'}, {key: 'Y', title: 'Y'}, {key: 'Z', title: 'Z'}, {key: 'AbsorbingAtom', title: 'Absorbing Atom?'}],
                absorbingAtom: false,
                absorbingAtomDisabled: false,

                // Cell_Parameters
                cellParamsType: '',
                cellParamData: [
                    { ID: 1, X: 0, Y: 0, Z: 0 },
                    { ID: 2, X: 0, Y: 0, Z: 0 },
                    { ID: 3, X: 0, Y: 0, Z: 0 }
                ],
                // MP_API
                mpApiToken: '',
                mpApiId: '',
                mpApiAtom: 'required|decimal|min_value:1|max_value:100',

                // Can use decimal:5 to limit 5 decimal places
                atomRules: '',
                orcaAtomRules: 'required|decimal|min_value:-100|max_value:100',
                fdmnesAtomRules: 'required|decimal|min_value:-1|max_value:1'
            }
        },

        computed: {
            // Elements with pseudopotential files - may be deprecated since last set of PP changes
            ppElements: function(){
                return this.elements.filter(function(e){
                    if(e.pseudopotential) {
                        return e.pseudopotential
                    }
                })
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
            this.edge = this.fdmnes_abs_edge[0]
            this.crystal = 'Crystal'

            //qe
            this.forces = '.FALSE.'
            this.occupations = 'smearing'
            this.smearing = 'gaussian'

            this.overviewBuilder()
        },

        mounted: function(){
            this.$refs.orcaTabButton.classList.add('active')
            this.$refs.systemCardBtn.classList.add('active')
        },

        methods: {
            startCluster: function(){
                console.log('startCluster called')
                let self = this
                Backbone.ajax({
                    url: app.apiurl + '/conexs',
                    data: { login: app.user },
                    method: 'POST',
                    success: function(response){
                        if(response['cluster']){
                            if(response['cluster'].status == 'new'){
                                console.log('starting new cluster for: ' + app.user)
                                self.isSubmitEnabled = false

                                setInterval(function(){
                                    self.pollClusterStatus()
                                }, 5000)

                                setInterval(function(){
                                    self.getJobStatus()
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
                    url: app.apiurl + '/conexs/status',
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
                    url: app.apiurl + '/conexs/jobs',
                    data: {
                        login: app.user
                    },
                    method: 'GET',
                    success: function(response){
                        self.jobData = response
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
                this.structureFile = null

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

                this.$refs.systemCardBtn.classList.remove('active')
                this.$refs.atomicPositionCardBtn.classList.remove('active')
                this.$refs.cellParamsCardBtn.classList.remove('active')
                this.$refs.mpApiBtn.classList.remove('active')
                this.$refs[name].classList.add('active')

                switch(name){
                    case "systemCardBtn":
                        this.card = 'system'
                        break
                    case "atomicPositionCardBtn":
                        this.card = 'position'
                        break
                    case "cellParamsCardBtn":
                        this.card = 'cellParams'
                        break
                    case "mpApiBtn":
                        this.card = 'mpApi'
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

                if (event && event.target.files[0] || this.structureFile) {
                    var structureFileName = this.structureFile ? this.structureFile.name : event.target.files[0].name

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

                    for(var i=0; i<this.atomData.length; i++){
                        this.output += this.atomData[i].Atom + ' ' + this.atomData[i].X + ' ' + this.atomData[i].Y + ' ' + this.atomData[i].Z + "\n"
                    }
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
                this.output += this.edge + "\n\n"
                this.output += 'Z_absorber' + "\n"

                for(var i=0; i<this.elements.length; i++){
                    if(this.element == this.elements[i]['element']){
                        this.output += this.elements[i]['number'] + "\n\n"
                    }
                }

                this.output += 'SCF' + '        !Performs self-consistent calculation' + "\n"
                this.output += 'Energpho' + '       !Output energy relative to the photon energy of absorbing atom' + "\n\n"
                this.output += this.fdmnes_method ? "Green\n" : ""
                this.output += 'Quadrupole' + "\n"

                if(this.edge.includes('L'))
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

                if (event && event.target.files[0] || this.structureFile) {
                    var structureFileName = this.structureFile ? this.structureFile.name : event.target.files[0].name

                    if(structureFileName.endsWith('.cif')){
                        this.output += 'Cif_file' + "\n"
                        this.output += structureFileName
                    }
                    else if(structureFileName.endsWith('.pdb')){
                        this.output += 'Pdb_file' + "\n"
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
                this.output += " outdir = \'.\/\' \n"
                this.output += " prefix = \'" + this.prefix + "\' \n"
                this.output += " pseudo_dir = \'.\/\' \n"
                this.output += " restart_mode = \'" + this.restart_mode + "\' \n"
                this.output += " title = \'" + this.title + "\' \n"
                this.output += " tprnfor = " + this.forces + "\n"
                this.output += " verbosity = \'" + this.verbosity + "\' \n"
                this.output += " forc_conv_thr = " + this.forc_conv_thr + "\n"
                this.output += "/ \n\n"

                this.output += "&SYSTEM \n"
                this.output += " ibrav = " + this.ibrav + "\n"

                if(this.conductivity == 'metallic'){
                    this.occupations = 'smearing'
                    this.smearing = 'fermi-dirac'
                    this.degauss = '5.0000000000d-03'
                    this.output += " occupations = \'" + this.occupations + "\'\n"
                    this.output += " smearing = \'" + this.smearing + "\'\n"
                    this.output += " degauss = " + this.degauss + "\n"
                } else {
                    this.occupations = ''
                    this.smearing = ''
                    this.degauss = ''
                }

                if((this.electronCount % 2) == 1){
                    this.output += " nspin = 2 \n"
                    this.output += " tot_magnetization = 1.0000000000d+00 \n"
                }

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

                var ppe = []

                this.atomData.forEach(function(item, index){
                    self.ppElements.forEach(function(el, idx){
                        if(el.element == item.Atom && !ppe.includes(el.element) || el.element == item.Atom && item.AbsorbingAtom == 'Yes'){
                            if(item.AbsorbingAtom == 'Yes'){
                                self.output += el.element + "* " + el.mass + " " + el.pseudopotential + "\n"
                                ppe.push(el.element + '*')
                            }
                            else {
                                self.output += el.element + " " + el.mass + " " + el.pseudopotential + "\n"
                                ppe.push(el.element)
                            }
                        }
                    })
                })
                this.output += "\n\n"

                this.output += "ATOMIC_POSITIONS {" + this.atomicPositionType + "}\n"

                this.atomData.forEach(function(item, index){
                    console.log(item)
                    if(item.AbsorbingAtom == 'Yes')
                        self.output += item.Atom + "* " + item.X + " " + item.Y + " " + item.Z + "\n"
                    else
                        self.output += item.Atom + " " + item.X + " " + item.Y + " " + item.Z + "\n"
                })
                this.output += "\n\n"

                this.output += "K_POINTS automatic\n"
                this.output += "1 1 1 0 0 0\n"
                this.output += "\n\n"

                this.output += "CELL_PARAMETERS {" + this.cellParamsType + "}\n"

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

            fetchMpApi: function(e){
                e.preventDefault()
                let self = this

                self.isLoading = true

                let data = {
                        mpapiToken: self.mpApiToken,
                        mpapiMaterial: self.mpApiId,
                        mpapiAbsorbingAtom: self.mpApiAtom
                    }

                let formData = new FormData()

                // Add data
                for(var key in data){
                    formData.append(key, data[key])
                }

                Backbone.ajax({
                    url: app.apiurl + '/conexs/mpapi',
                    data: formData,
                    method: 'POST',
                    // Required to allow split content type between file/data
                    // Stops AJAX setting it's preferred defaults
                    contentType: false,
                    processData: false,

                    success: function(response) {
                        self.isLoading = false
                        console.log(response)
                        if(!response.error){
                            self.inputFileContents = response
                            console.log('got no error in body of MP API fetching response')
                            app.alert({className: 'message notify', message: "Fetching completed"})                                    
                        } else {
                            console.log('error in body of MP API fetching response')
                            app.alert({className: 'Error', message: response.error})
                        }
                    },

                    error: function(response) {
                        self.isLoading = false
                        console.log(response)
                        app.alert({ title: 'Error', message: response })
                    },
                })

            },

            onSubmit: function(e){
                e.preventDefault()
                let self = this

                /* Useful for debugging v-validate errors
                for(var i=0; i<this.$validator.errors.items.length;i++){
                    console.log(this.$validator.errors.items[i].field + ' ' + this.$validator.errors.items[i].msg)
                }*/

                this.$validator.validateAll().then(function(result){
                    self.isLoading = true

                    if(result && self.inputFileContents != ''){

                        let data = {
                            data: self.inputFileContents,
                            charge: self.charge,
                            multiplicity: self.multiplicity,
                            cpu: self.cpus,
                            memory: self.memory,
                            fedid: app.user,
                            element: self.element,

                            fdmnes_method: self.fdmnes_method,
                            edge: self.edge,
                            crystal: self.crystal,

                            calculation: self.calculation,
                            etot_conv_thr: self.etot_conv_thr,
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
                            form: self.form,
                        }

                        let formData = new FormData()

                        // Add data
                        for(var key in data){
                            formData.append(key, data[key])
                        }

                        if(self.form == 'orca'){
                            formData.append('orcaSpectrumType', self.orcaSpectrumType)
                            formData.append('orcaStartValue', self.orcaStartValue)
                            formData.append('orcaStopValue', self.orcaStopValue)
                            formData.append('orcaBroadening', self.orcaBroadening)
                        }

                        // Add structure file
                        if(self.$refs.orcaStructureFile.value){
                            console.log(self.$refs.orcaStructureFile.value)
                            formData.append('orcaStructureFile', self.structureFile)
                        } else if (self.$refs.fdmnesStructureFile.value) {
                            console.log(self.$refs.fdmnesStructureFile.value)
                            formData.append('fdmnesStructureFile', self.structureFile)
                        }

                        Backbone.ajax({
                            url: app.apiurl + '/conexs/submit',
                            data: formData,
                            method: 'POST',
                            // Required to allow split content type between file/data
                            // Stops AJAX setting it's preferred defaults
                            contentType: false,
                            processData: false,

                            success: function(response) {
                                self.isLoading = false
                                if(!response.error){
                                    console.log('got no error in response to job submission')
                                    app.alert({className: 'message notify', message: "Successfully submitted conexs file contents!"})                                    
                                } else {
                                    console.log('error upon job submission')
                                    app.alert({className: 'Error', message: response.error})
                                }                                
                            },
                            error: function(response) {
                                self.isLoading = false
                                app.alert({ title: 'Error', message: response })
                            },
                        })
                    } else {
                        self.isLoading = false
                        app.alert({ title: 'Error', message: 'No file provided, selected file is empty, or form elements are invalid.'})
                    }
                })
            },

            addAtom: function(){
                var newAtom
                if(this.atom){

                    if(this.form == 'qe') {
                        let self = this
                        let exists = false
                        this.atomData.forEach(function(item, index){
                            if(item.Atom == self.atom && item.AbsorbingAtom == 'Yes' && self.absorbingAtom || item.Atom == self.atom && item.AbsorbingAtom == 'No' && !self.absorbingAtom){
                                exists = true
                            }
                        })
                        if(!exists) {
                            this.ntyp = this.ntyp+1
                        }

                        this.elements.forEach(function(item, index){
                            if(item.element == self.atom){
                                self.electronCount += item.number
                            }
                        })
                    }

                    newAtom = {
                        ID: this.atomData.length,
                        Atom: this.atom,
                        X: this.atomX,
                        Y: this.atomY,
                        Z: this.atomZ,
                        AbsorbingAtom: this.absorbingAtom ? 'Yes' : 'No'
                    }
                    this.atomData[this.atomData.length] = newAtom

                    if(this.absorbingAtom)
                        this.absorbingAtomDisabled = true

                    if(this.structureFile) {
                        this.structureFile = null
                        this.$refs.orcaStructureFile.value = ''
                        this.$refs.fdmnesStructureFile.value = ''
                    }

                    // Select the next available element or loop back to the first
                    // Works around problem described below
                    // QE uses a computed subset of elements
                    if(this.form == 'qe'){
                        for(var i = 0; i<this.ppElements.length; i++){
                            if(this.ppElements[i].element == this.atom){
                                if(i == this.ppElements.length -1){
                                    this.atom = 'H'
                                } else {
                                    this.atom = this.ppElements[++i].element
                                }
                            }
                        }
                    } else {
                        for(var i = 0; i<this.elements.length; i++){
                            if(this.elements[i].element == this.atom){
                                if(i == this.elements.length -1){
                                    this.atom = 'H'
                                } else {
                                    this.atom = this.elements[++i].element
                                }
                            }
                        }
                    }

                    // We want to reset this back to an element, but if it's the same element we just added the table doesn't transition properly
                    // Need to either debug the table component (somehow) to see why. Above code is a work around
                    //this.atom = ''
                    this.atomX = 0
                    this.atomY = 0
                    this.atomZ = 0
                    this.absorbingAtom = false
                } else {
                    app.alert({title: 'Error', message: "Invalid atom data!"})
                }

                if(this.form == 'qe'){
                    this.nat = this.atomData.length
                }
            },

            removeAtom: function(atomID){
                var atomIndex
                var atomName
                var absorbingAtomLocal
                for(var i = 0; i< this.atomData.length; i++){
                    if(this.atomData[i].ID == atomID){
                        atomIndex = i
                        atomName = this.atomData[i].Atom
                        absorbingAtomLocal = this.atomData[i].AbsorbingAtom
                        break
                    }
                }

                if(this.atomData[atomIndex].AbsorbingAtom == 'Yes')
                    this.absorbingAtomDisabled = false

                this.atomData.splice(atomIndex, 1)

                if(this.form == 'qe') {
                    this.nat = this.atomData.length

                    var exists = false
                    this.atomData.forEach(function(item, index){
                        if(item.Atom == atomName && absorbingAtomLocal == 'Yes' && item.AbsorbingAtom == 'Yes' || item.Atom == atomName && absorbingAtomLocal == 'No' && item.AbsorbingAtom == 'No'){
                            exists = true
                        }
                    })
                    if(!exists) {
                        this.ntyp = this.ntyp-1
                    }

                    let self = this
                    this.elements.forEach(function(item, index){
                        if(item.element == atomName){
                            self.electronCount -= item.number
                        }
                    })
                }
            },

            setStructureFile: function(event){
                this.structureFile = event.target.files[0]
            },

            killJob: function(jobID){
                console.log('kill job pressed for jobId: ' + jobID)
                this.$refs['job'+jobID].disabled = true
                
                let self = this
                Backbone.ajax({
                    url: app.apiurl + "/conexs/kill",
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
                        self.$refs['job'+jobID].disabled = false
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
    input[type="text"]:focus {
        width: 50px;
        background-color: #42b3d569;
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