<template>
    
<section class="content">
    <h1>Add Relion Processing</h1>

    <p class="help">This page is for submitting processing jobs to Relion.</p>

    <p v-if="isSessionArchived && showArchivedMessage" class="message alert">
        This session has been archived. It may no longer be submitted for processing. <a
            class="button refresh" v-on:click.prevent="showArchivedMessage = false">OK</a>
    </p>

    <form novalidate v-bind:class="{loading: showSpinner}">
        <div class="form">
            <ul>
                <li class="head">Project</li>

                <li>
                    <label>Acquisition Software</label>
                    <select name="projectAcquisitionSoftware"
                            v-if="!isFormReadOnly"
                            v-model="projectAcquisitionSoftware">
                        <option value="EPU">EPU</option>
                        <option value="SerialEM">SerialEM</option>
                    </select>

                    <input type="text" name="projectAcquisitionSoftware"
                           v-if="isFormReadOnly"
                           v-model="projectAcquisitionSoftware"
                           v-bind:readonly="true"
                           style="margin-bottom: 20px">
                </li>

                <li>
                    <label>Movie File Name Extension</label>
                    <select name="projectMovieFileNameExtension"
                            v-if="!isFormReadOnly"
                            v-model="projectMovieFileNameExtension">
                        <option value=".tif">.tif</option>
                        <option value=".tiff">.tiff</option>
                        <option value=".mrc">.mrc</option>
                    </select>

                    <input type="text" name="projectMovieFileNameExtension"
                           v-if="isFormReadOnly"
                           v-model="projectMovieFileNameExtension"
                           v-bind:readonly="true"
                           style="margin-bottom: 20px">
                </li>

                <li>
                    <label>Gain Reference File</label>
                    <input type="checkbox" name="projectGainReferenceFile"
                           v-model="projectGainReferenceFile"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li v-if="projectGainReferenceFile">
                    <label>Gain Reference File Name</label>
                    <input type="text" name="projectGainReferenceFileName"
                           v-validate="{ required: true, regex: /^[\w-]+\.[\w]{3,4}$/ }"
                           v-model="projectGainReferenceFileName"
                           v-bind:readonly="isFormReadOnly">
                    <span v-if="errors.has('projectGainReferenceFileName')" class="errormessage ferror">{{ errors.first('projectGainReferenceFileName') }}</span>
                </li>

                <li class="head">Experiment</li>

                <li>
                    <label>Voltage (kV)</label>
                    <select name="voltage"
                            v-if="!isFormReadOnly"
                            v-model="voltage">
                        <option value="200">200</option>
                        <option value="300">300</option>
                    </select>

                    <input type="text"
                           v-if="isFormReadOnly"
                           v-model="voltage"
                           v-bind:readonly="true"
                           style="margin-bottom: 20px">
                </li>

                <li>
                    <label>Spherical Aberration (mm)</label>
                    <select name="sphericalAberration"
                            v-if="!isFormReadOnly"
                            v-model="sphericalAberration">
                        <option value="2.7">2.7 (Talos/Krios)</option>
                    </select>

                    <input type="text" name="sphericalAberration"
                           v-if="isFormReadOnly"
                           v-model="sphericalAberration"
                           v-bind:readonly="true"
                           style="margin-bottom: 20px">
                </li>

                <li>
                    <label>Phase Plate Used</label>
                    <input type="checkbox" name="findPhaseShift"
                           v-model="findPhaseShift"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li>
                    <label>Pixel Size (Å/pixel)</label>
                    <input type="text" name="pixelSize"
                           v-validate="'required|min_value:0.02|max_value:100'"
                           v-model="pixelSize"
                           v-on:keyup="onCalculateForMe"
                           v-bind:readonly="isFormReadOnly">
                    <span v-if="errors.has('pixelSize')"
                          class="errormessage ferror">{{ errors.first('pixelSize') }}</span>
                </li>

                <li>
                    <label>Motion Correction Binning</label>
                    <select name="voltage"
                            v-if="!isFormReadOnly"
                            v-model="motionCorrectionBinning">
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>

                    <input type="text"
                           v-if="isFormReadOnly"
                           v-model="motionCorrectionBinning"
                           v-bind:readonly="true"
                           style="margin-bottom: 20px">
                </li>

                <li>
                    <label>Dose per frame (e<span class="super">-</span>/Å<span class="super">2</span>)</label>
                    <input type="text" name="dosePerFrame"
                           v-validate="'required|min_value:0.02|max_value:10'"
                           v-model="dosePerFrame"
                           v-bind:readonly="isFormReadOnly">
                    <span v-if="errors.has('dosePerFrame')" class="errormessage ferror">{{ errors.first('dosePerFrame') }}</span>
                </li>

                <li>
                    <label>Continue after CTF estimation</label>
                    <input type="checkbox" name="pipelineDo1stPass"
                           v-model="pipelineDo1stPass"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li class="head" v-if="pipelineDo1stPass">2D &amp; 3D Classification</li>

                <li v-if="pipelineDo1stPass">
                    <label>Do 2D Classification</label>
                    <input type="checkbox" name="pipelineDo1stPassClassification2d"
                           v-model="pipelineDo1stPassClassification2d"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Do 3D Classification</label>
                    <input type="checkbox" name="pipelineDo1stPassClassification3d"
                           v-model="pipelineDo1stPassClassification3d"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li class="head" v-if="pipelineDo1stPass">Particle Picking</li>

                <li v-if="pipelineDo1stPass">
                    <label>Use crYOLO</label>
                    <input type="checkbox" name="particleUseCryolo"
                           v-model="particleUseCryolo"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Minimum Diameter (Å)</label>
                    <input type="text" name="particleDiameterMin"
                           v-validate="'required|min_value:0.02|max_value:1024'"
                           v-model="particleDiameterMin"
                           v-bind:readonly="isFormReadOnly">
                    <span v-if="errors.has('particleDiameterMin')" class="errormessage ferror">{{ errors.first('particleDiameterMin') }}</span>
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Maximum Diameter (Å)</label>
                    <input type="text" name="particleDiameterMax"
                           v-validate="'required|min_value:0.02|max_value:4000'"
                           v-model="particleDiameterMax"
                           v-on:keyup="onCalculateForMe"
                           v-bind:readonly="isFormReadOnly">
                    <span v-if="errors.has('particleDiameterMax')" class="errormessage ferror">{{ errors.first('particleDiameterMax') }}</span>
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Mask Diameter (Å)</label>
                    <input type="text" name="particleMaskDiameter"
                           v-validate="'required|min_value:0.1|max_value:1024'"
                           v-model="particleMaskDiameter"
                           v-bind:readonly="isFormReadOnly || particleCalculateForMe">
                    <span v-if="errors.has('particleMaskDiameter')" class="errormessage ferror">{{ errors.first('particleMaskDiameter') }}</span>
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Box Size (px)</label>
                    <input type="text" name="particleBoxSize"
                           v-validate="'required|min_value:0.1|max_value:1024'"
                           v-model="particleBoxSize"
                           v-bind:readonly="isFormReadOnly || particleCalculateForMe">
                    <span v-if="errors.has('particleBoxSize')" class="errormessage ferror">{{ errors.first('particleBoxSize') }}</span>
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Downsample Box Size (px)</label>
                    <input type="text" name="particleBoxSizeSmall"
                           v-validate="'required|min_value:0.1|max_value:1024'"
                           v-model="particleBoxSizeSmall"
                           v-bind:readonly="isFormReadOnly || particleCalculateForMe">
                    <span v-if="errors.has('particleBoxSizeSmall')" class="errormessage ferror">{{ errors.first('particleBoxSizeSmall') }}</span>
                </li>

                <li v-if="pipelineDo1stPass">
                    <label>Calculate For Me</label>
                    <input type="checkbox" name="particleCalculateForMe"
                           v-model="particleCalculateForMe"
                           @change="onCalculateForMe"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li class="head" v-if="pipelineDo1stPass">Second Pass</li>

                <li v-if="pipelineDo1stPass">
                    <label>Do Second Pass</label>
                    <input type="checkbox" name="pipelineDo2ndPass"
                           v-model="pipelineDo2ndPass"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li v-if="pipelineDo1stPass && pipelineDo2ndPass">
                    <label>Do 2D Classification</label>
                    <input type="checkbox" name="pipelineDo2ndPassClassification2d"
                           v-model="pipelineDo2ndPassClassification2d"
                           v-bind:disabled="isFormReadOnly">
                </li>

                <li v-if="pipelineDo1stPass && pipelineDo2ndPass">
                    <label>Do 3D Classification</label>
                    <input type="checkbox" name="pipelineDo2ndPassClassification3d"
                           v-model="pipelineDo2ndPassClassification3d"
                           v-bind:disabled="isFormReadOnly">
                </li>
            </ul>

            <button type="submit" class="button submit"
                    v-on:click.prevent="onStart"
                    v-if="!isJobStarted && !isJobStopped && !isSessionArchived"
                    v-bind:disabled="errors.any()">
                Start Processing
            </button>

        </div>
    </form>
</section>

</template>

<script>
import Backbone from 'backbone'
import formatDate from 'formatDate'
import RelionModel from 'modules/types/em/relion/models/relion'
import SessionModel from 'models/visit'
import EventBus from 'app/components/utils/event-bus.js'
import JobParameters from 'modules/types/em/relion/components/job-parameters.vue'

export default {
    name: 'relion-processing-form',
    props: {
        session_str: String,
    },
    data: function () {
        return {
            showSpinner: false,

            // GUI
            isSessionLoaded: false,
            isSessionActive: false,
            isSessionArchived: false,
            isFormReadOnly: true,
            isJobStarted: false,
            isJobStopped: false,
            isLogVisible: false,
            processingJobs: [],

            // Session
            session: {},
            sessionEndDateAsString: '',

            // Form fields
            projectAcquisitionSoftware: null,
            projectMovieFileNameExtension: null,
            projectGainReferenceFile: null,
            projectGainReferenceFileName: null,

            voltage: null,
            sphericalAberration: null,
            findPhaseShift: null,
            pixelSize: null,
            motionCorrectionBinning: null,
            dosePerFrame: null,

            pipelineDo1stPass: null,
            pipelineDo1stPassClassification2d: null,
            pipelineDo1stPassClassification3d: null,

            particleUseCryolo: null,
            particleDiameterMin: null,
            particleDiameterMax: null,
            particleMaskDiameter: null,
            particleBoxSize: null,
            particleBoxSizeSmall: null,
            particleCalculateForMe: null,

            pipelineDo2ndPass: null,
            pipelineDo2ndPassClassification2d: null,
            pipelineDo2ndPassClassification3d: null,

            showArchivedMessage: true,
        }
    },
    created: function () {
        this.showSpinner = true;

        let sessionModel = new SessionModel({
            VISIT: this.session_str
        });

        this.$store.dispatch('getModel', sessionModel).then( (model) => {
            this.session = sessionModel.attributes;

            this.isSessionLoaded = true;
            this.isSessionActive = !!+this.session['ACTIVE']; // ACTIVE represented by string value "0" or "1" in JSON
            this.isSessionArchived = !!+this.session['ARCHIVED'];

            // TODO Temporary override to make session active for testing after session has ended (JPH)
            this.isSessionActive = 1;

            if (this.isSessionActive) {
                this.resetForm();
            } else {
                this.sessionEndDateAsString = this.session['ENISO'].toFormat("HH:mm 'on' d MMMM yyyy");
            }
            let breadcrumbs = [
                {title: 'Data Collections', url: '/dc'},
                {title: this.session['BL']},
                {title: this.session['VISIT'], url: '/dc/visit/' + this.session['VISIT']},
                {title: 'Relion Processing'}
            ]
            this.setBreadcrumbs(breadcrumbs)
        }, (error) => {
            this.setBreadcrumbs([{title: 'Error'}]);
            this.$store.commit('notifications/addNotification', {title: 'No such session', message: 'The specified session does not exist'})
        }).finally( () => {
            this.showSpinner = false
        })
    },
    methods: {
        setBreadcrumbs: function(breadcrumbs) {
            if (breadcrumbs) EventBus.$emit('bcChange', breadcrumbs)
        },
        // With new build and (IE polyfill) we could use
        // Object.assign() to reset all data to initial state
        // Using the method below is simple alternative that
        // allows us to clear form data after submission
        resetForm: function () {
            this.isJobStarted = false;
            this.processingIsActive = false;
            this.processingTimestamp = false;

            this.projectAcquisitionSoftware = 'EPU';
            this.projectMovieFileNameExtension = '.tiff';
            this.projectGainReferenceFile = false;
            this.projectGainReferenceFileName = 'gain.mrc';

            this.voltage = 300;
            this.sphericalAberration = 2.7;
            this.findPhaseShift = null;
            this.pixelSize = null;
            this.motionCorrectionBinning = 1;
            this.dosePerFrame = 0.5;

            this.pipelineDo1stPass = false;
            this.pipelineDo1stPassClassification2d = true;
            this.pipelineDo1stPassClassification3d = false;

            this.particleUseCryolo = false;
            this.particleDiameterMin = null;
            this.particleDiameterMax = null;
            this.particleMaskDiameter = null;
            this.particleBoxSize = null;
            this.particleBoxSizeSmall = null;
            this.particleCalculateForMe = true;

            this.pipelineDo2ndPass = false;
            this.pipelineDo2ndPassClassification2d = false;
            this.pipelineDo2ndPassClassification3d = false;

            this.isLogVisible = false;

            this.checkStatus();

            // To reset form validation, we should wait for next tick
            // Vue reactivity means the DOM will not be updated immediately
            this.$nextTick(function () {
                this.$validator.reset()
            })
        },

        onCalculateForMe: function () {
            if (this.pipelineDo1stPass && this.particleCalculateForMe) {
                if (
                    !this.pixelSize ||
                    isNaN(this.pixelSize) ||
                    this.errors.has('pixelSize') ||

                    !this.particleDiameterMax ||
                    isNaN(this.particleDiameterMax) ||
                    this.errors.has('particleDiameterMax')
                ) {
                    this.particleMaskDiameter = null;
                    this.particleBoxSize = null;
                    this.particleBoxSizeSmall = null;
                } else {
                    let particleSizePixels = this.particleDiameterMax / this.pixelSize;

                    this.particleMaskDiameter = Math.round(this.particleDiameterMax * 1.1);
                    this.particleBoxSize = calculateBoxSize(particleSizePixels, this.motionCorrectionBinning);
                    this.particleBoxSizeSmall = calculateBoxSizeSmall(this.particleBoxSize, this.pixelSize, this.motionCorrectionBinning);
                }
            }

            function calculateBoxSize(particleSizePixels, motionCorrectionBinning) {
                let boxSizeExact = particleSizePixels * 1.2;
                let boxSizeInt = Math.ceil(boxSizeExact);
                return boxSizeInt + (boxSizeInt % 2);
            }                    

            function calculateBoxSizeSmall(particleBoxSize, pixelSize, motionCorrectionBinning) {
                let boxSizes = [48, 64, 96, 128, 160, 192, 256, 288, 300, 320, 360, 384, 400, 420, 450, 480, 512, 640, 768, 896, 1024];

                for (let i = 0; i < boxSizes.length; i++) {
                    let boxSize = boxSizes[i];

                    if (boxSize > particleBoxSize) return particleBoxSize;

                    if (((pixelSize * particleBoxSize) / boxSize) < 4.25) return boxSize;
                }

                return "Box size is too large!";
            }
        },

        onStart: function () {
            let self = this;

            this.$validator.validateAll().then(function (result) {
                if (result) {
                    self.showSpinner = true;

                    // Convert form inputs from string to float, integer, or boolean data type.
                    // Ensures values are correctly encoded in JSON, not as strings of text.
                    // parseInt() and parseFloat() trim whitespace characters.
                    // parseInt() removes fractional-part of numeric input.
                    // Updates form inputs with converted values.

                    self.voltage = parseInt(self.voltage);
                    self.sphericalAberration = parseFloat(self.sphericalAberration);
                    self.findPhaseShift = self.findPhaseShift === true;
                    self.pixelSize = parseFloat(self.pixelSize);
                    self.motionCorrectionBinning = parseInt(self.motionCorrectionBinning);
                    self.dosePerFrame = parseFloat(self.dosePerFrame);

                    self.pipelineDo1stPass = self.pipelineDo1stPass === true;
                    self.pipelineDo1stPassClassification2d = self.pipelineDo1stPassClassification2d === true;
                    self.pipelineDo1stPassClassification3d = self.pipelineDo1stPassClassification3d === true;

                    if (self.pipelineDo1stPass) {
                        self.particleUseCryolo = self.particleUseCryolo === true;
                        // TODO Ensure particleDiameterMin < particleDiameterMax. (JPH)
                        self.particleDiameterMin = parseFloat(self.particleDiameterMin);
                        self.particleDiameterMax = parseFloat(self.particleDiameterMax);
                        self.particleMaskDiameter = parseInt(self.particleMaskDiameter);
                        self.particleBoxSize = parseInt(self.particleBoxSize);
                        self.particleBoxSizeSmall = parseInt(self.particleBoxSizeSmall);
                        self.particleCalculateForMe = self.particleCalculateForMe === true;
                    }

                    self.pipelineDo2ndPass = self.pipelineDo2ndPass === true;
                    self.pipelineDo2ndPassClassification2d = self.pipelineDo2ndPassClassification2d === true;
                    self.pipelineDo2ndPassClassification3d = self.pipelineDo2ndPassClassification3d === true;

                    let model = new RelionModel({
                        id: self.session['VISIT'],

                        projectAcquisitionSoftware: self.projectAcquisitionSoftware,
                        projectMovieFileNameExtension: self.projectMovieFileNameExtension.substr(1),
                        projectGainReferenceFile: self.projectGainReferenceFile,
                        projectGainReferenceFileName: (self.projectGainReferenceFile ? self.projectGainReferenceFileName : null),

                        voltage: self.voltage,
                        sphericalAberration: self.sphericalAberration,
                        findPhaseShift: self.findPhaseShift,
                        pixelSize: self.pixelSize,
                        motionCorrectionBinning: self.motionCorrectionBinning,
                        dosePerFrame: self.dosePerFrame,

                        pipelineDo1stPass: self.pipelineDo1stPass,
                        pipelineDo1stPassClassification2d: (self.pipelineDo1stPass ? self.pipelineDo1stPassClassification2d : false),
                        pipelineDo1stPassClassification3d: (self.pipelineDo1stPass ? self.pipelineDo1stPassClassification3d : false),

                        particleUseCryolo: (self.pipelineDo1stPass ? self.particleUseCryolo : false),
                        particleDiameterMin: (self.pipelineDo1stPass ? self.particleDiameterMin : null),
                        particleDiameterMax: (self.pipelineDo1stPass ? self.particleDiameterMax : null),
                        particleMaskDiameter: self.particleMaskDiameter,
                        particleBoxSize: self.particleBoxSize,
                        particleBoxSizeSmall: self.particleBoxSizeSmall,
                        particleCalculateForMe: self.particleCalculateForMe,

                        pipelineDo2ndPass: self.pipelineDo2ndPass,
                        pipelineDo2ndPassClassification2d: (self.pipelineDo2ndPass ? self.pipelineDo2ndPassClassification2d : false),
                        pipelineDo2ndPassClassification3d: (self.pipelineDo2ndPass ? self.pipelineDo2ndPassClassification3d : false),
                    });

                    self.isLogVisible = true;

                    model.save({}, {
                        type: 'POST',
                        success: function (model, response, options) {
                            self.isFormReadOnly = true;
                            self.isJobStarted = true;
                            self.showSpinner = false;

                            if ('timestamp' in response) {
                                // self.sessionEvents.unshift({
                                //     timestamp_str: formatDate.default(response.timestamp, 'HH:mm:ss'),
                                //     message: 'Start processing.'
                                // });
                            }
                        },
                        error: function (model, response, options) {
                            self.showSpinner = false;

                            let alertMessage = 'There was a problem starting this request.';

                            if ('message' in response.responseJSON) {
                                alertMessage = response.responseJSON.message;
                            }

                            app.alert({message: alertMessage});
                        }
                    })
                } else {
                    console.log('Form submission prevented, validation failed.');
                }
            });
        },

        onStop: function (id) {
            let self = this;

            Backbone.ajax({
                type: 'PATCH',
                url: app.apiurl + '/em/process/relion/job/' + id,
                success: function (xhr) {
                    self.isJobStopped = true;

                    if ('timestamp' in xhr) {
                        // self.sessionEvents.unshift({
                        //     timestamp_str: formatDate.default(xhr.timestamp, 'HH:mm:ss'),
                        //     message: 'Stop processing.'
                        // });
                    }
                },
                error: function (model, response, options) {
                    self.showSpinner = false;

                    let alertMessage = 'There was a problem stopping this job.';

                    if ('message' in response.responseJSON) {
                        alertMessage = response.responseJSON.message;
                    }

                    app.alert({message: alertMessage});
                }
            })
        },

        checkStatus: function () {
            let self = this;

            Backbone.ajax({
                type: 'GET',
                url: app.apiurl + '/em/process/relion/session/' + this.session['VISIT'],
                success: function (xhr) {
                    if ('processingIsActive' in xhr) {
                        self.processingIsActive = xhr.processingIsActive;
                    }

                    if ('processingTimestamp' in xhr) {
                        self.processingTimestamp = xhr.processingTimestamp;
                    }

                    if (self.processingIsActive === true) {
                        self.isFormReadOnly = true;
                        self.isJobStarted = true;
                        // self.isJobStopped = false;
                    } else {
                        self.isFormReadOnly = false;
                    }
                },
                error: function (model, response, options) {
                    self.showSpinner = false;

                    let alertMessage = 'There was a problem checking this job.';

                    if ('message' in response.responseJSON) {
                        alertMessage = response.responseJSON.message;
                    }

                    app.alert({message: alertMessage});
                }
            })
        },
    }
}
</script>
