<template>

        <div class="marionette-wrapper">
            <!-- This is the element we attach the marionette view to -->
            <div id="marionette-view" class="content"></div>
        </div>
    
</template>

<script>
import Marionette from 'marionette'
import EventBus from 'js/app/components/utils/event-bus.js'

export default {
    name: 'MarionetteWrapper',
    props: {
        'mview': [Function, Promise], // The marionette view could be lazy loaded or static import 
        'breadcrumbs' : Array,
        'breadcrumb_tags' : Array, // These are model properties appended to the breadcrumbs title
        'options': Object,
        // If this component is wrapped by another, then the beforeRouteEnter will not fire
        // beforeRouteEnter only fires when loaded directly as a component by VueRouter
        // Instead we can pass in models/collections and fetch them as soon as this component is mounted
        'fetchOnLoad': { 
            type: Boolean,
            default: false,
        },
        // Rare case where model or collection has already been loaded
        // Used when router guard does not need to prefetch the data
        // For example where we are using a wrapper component and we've already loaded the model or collection
        'preloaded' : {
            type: Boolean,
            default: false,
        }
    },
    data: function() {
        return {
            marionetteRegion: null,
            marionetteView: null,
            modelsLoaded: false,
        }
    },
    computed: {
        // If we have a model or collection passed in, we need to fetch the data before rendering the view
        hasModelOrCollection: function() {
            if ( this.options && (this.options.model || this.options.collection) ) return true
            else return false
        }
    },
    watch: {
        // If we are prefetching data, wait for loaded state (boolean) before rendering
        modelsLoaded: function(loaded) {
            if (loaded) {
                this.initialiseView()
            }
        },
    },
    created: function() {
        console.log("MarionetteViewWrapper::created " + this.$router.currentRoute.path )

        this.marionetteRegion = new Marionette.Region({
            el: "#marionette-view"
        });
        // If we have been passed breadcrumbs, send the update event
        // We will update the breadcrumbs again if the model loads and tags are present
        if (this.breadcrumbs) EventBus.$emit('bcChange', this.breadcrumbs)
    },
    mounted: function() {
        // Intercept any 'a' tag links from within marionette views and delegate relative links to vue-router
        this.handleHTMLAnchorEvents()

        if (this.hasModelOrCollection === false) { this.initialiseView(); return }

        // If we have been loaded by Vue Router then prefetchData will already have been called.
        // It not and we are a child of another component, check if we have model or collection to fetch
        if (this.fetchOnLoad) { this.prefetchData(); return }

        // We have a model or collection but we have already loaded the data (i.e. a wrapper component), show the view
        if (this.preloaded)  { this.initialiseView() }
    },
    // Vue Router lifecycle method - we are navigating somewhere else
    beforeDestroy: function() {
        // We still have access to 'this' so tidy up the marionette view
        if (this.marionetteView) {
            console.log("MarionetteViewWrapper::beforeDestroy - cleaning up view ")
            this.marionetteView.destroy()
            this.marionetteRegion.reset()
        }
    },
    methods: {
        // Method to create an instance of the Marionette view
        // Handles the case if the passed mview prop is a Promise or a class
        initialiseView: function() {
            console.log("MarionetteViewWrapper::initialiseView")
            if (!this.mview) { console.log("MarionetteViewWrapper::initaliseView could not find passed view"); return }

            let options = {}

            // Now merge in any passed parameters
            if (this.options) options = Object.assign(options, this.options)

            // Deal with the passed marionette view.
            // This might be a promise to resolve or a static constructor.
            // Most Marionette views will be lazy loaded from their AMD module definitions until we convert to es2015 exports
            if (this.mview instanceof Promise) {
                this.mview.then((module) => {
                    this.marionetteView = new module.default(options)
                    this.renderView()
                })
            } else {
                this.marionetteView = new this.mview(options)
                this.renderView()
            }
        },
        // Trigger render of the Marionette view itself
        renderView: function() {
            // Switched to mounting the marionette view in a region of this component
            // This triggers the onShow method for marionette views
            this.marionetteRegion.show(this.marionetteView)
        },

        //
        // Promise Version - wait for collections and models to be prefetched before returning.
        // In reality we will only have a collection or a model, this handles either case
        //
        prefetchData: function() {
            if (!this.options) { return }
            if (!this.options.model && !this.options.collection) { return }
            
            const promiseCollection = this.fetchCollection(this.options.collection, this.options.queryParams)
            const promiseModel = this.fetchModel(this.options.model, this.options.queryParams)

            Promise.all([promiseCollection, promiseModel]).then((values) => {
                // Values will be an array of the resolved promises 0=collection, 1=model
                if (values[0]) {
                    // Collection was not reliably updated automatically so force update
                    // Crude but ensures the collection passed into the marionette view is up to date
                    // Need to check memory leaks, if so use the blunt approach below
                    this.options.collection = Object.assign(this.options.collection, values[0])
                }
                if (values[1]) {
                    // Model was not reliably updated automatically so force update
                    // They can be different depending on the scope of the model when it was created
                    this.options.model = Object.assign(this.options.model, values[1])
                }
                this.modelsLoaded = true
            })
        },
        fetchCollection: function(collection, queryParams) {
            return new Promise((resolve, reject) => {
                // If we have no collection return immediately
                if (!collection) { resolve() }

                this.$store.commit('loading', true)
                // We want to access 'this' from within the backbone callback
                let self = this
                // We can set queryParams at an options level, or within the collection constructor
                // This handles the former case - may not be needed in future...
                collection.queryParms = queryParams ? queryParams : null

                collection.fetch({
                    // Success returns collection object
                    success: function(c) {
                        self.$store.commit('loading', false)
                        resolve(c)
                    },
                    error: function() {
                        self.$store.commit('loading', false)
                        self.$store.commit('notifications/addNotification', { title: 'No such collection', message: 'The specified collection could not be found', level: 'error'})
                        reject()
                    }
                })
            })
        },
        fetchModel: function(model, queryParams=null) {
            return new Promise((resolve, reject) => {
                // If we have no model return immediately
                if (!model) { resolve() }
                
                this.$store.commit('loading', true)
                // We want to access 'this' from within the backbone callback
                let self = this
                // Note that for a model request, extra query parameters are passed in via data option
                // We pass in any queryParams to the data attribute for the fetch request
                model.fetch({
                    data: queryParams,
                    // Success returns model object
                    success: function(m) {
                        self.$store.commit('loading', false)

                        if (self.breadcrumb_tags) {
                            for (var i=0; i<self.breadcrumb_tags.length; i++) {
                                self.breadcrumbs.push({title: m.get(self.breadcrumb_tags[i])})
                            }
                            EventBus.$emit('bcChange', self.breadcrumbs)
                        }
                        resolve(m)
                    },
                    error: function() {
                        self.$store.commit('loading', false)
                        self.$store.commit('notifications/addNotification', { title: 'No such model', message: 'The specified model could not be found', level: 'error'})
                        reject()
                    }
                })
            })
        },
        handleHTMLAnchorEvents: function() {
            window.addEventListener('click', event => {
            // ensure we use the link, in case the click has been received by a subelement
            let { target } = event
            while (target && target.tagName !== 'A') target = target.parentNode
                // handle only links that do not reference external resources
                if (target && target.matches("a:not([href*='://'])") && target.href) {
                    // some sanity checks taken from vue-router:
                    // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
                    const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = event
                    // don't handle with control keys
                    if (metaKey || altKey || ctrlKey || shiftKey) return
                    // don't handle when preventDefault called
                    if (defaultPrevented) return
                    // don't handle right clicks
                    if (button !== undefined && button !== 0) return
                    // don't handle if `target="_blank"`
                    if (target && target.getAttribute) {
                        const linkTarget = target.getAttribute('target')
                        if (/\b_blank\b/i.test(linkTarget)) return
                    }
                    // don't handle same page links/anchors
                    const url = new URL(target.href)
                    const to = url.pathname
                    if (window.location.pathname !== to && event.preventDefault) {
                        event.preventDefault()
                        this.$router.push(to)
                    }
                }
            })
        }

    },
    // When MarionetteWrapper is the main route component, prefetchData as required
    // If this component is used directly from another vue component this will not be called
    // Instead the parent vue component will need to load the model/collection data as required
    beforeRouteEnter: function(to, from, next) {
        next(vm => vm.prefetchData())
    }
}
</script>
