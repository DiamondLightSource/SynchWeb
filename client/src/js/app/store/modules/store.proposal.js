import Proposal from 'models/proposal.js'
import ProposalLookup from 'models/proplookup.js'
import Backbone from 'backbone'

const proposalModule = {
  state: {
    // Proposal / visit info
    proposal: '',        // The proposal string (e.g. mx12345)
    proposalType: 'mx',  // Type of the proposal or default type for the user
    proposalModel: null, // A backbone model for the current proposal
    visit: '',
  },
  mutations: {
    //
    // Proposal and visit information
    //
    // Save backbone proposal model - set from action that retrieves model from server
    set_proposal_model(state, model) {
      // Needs to be a backbone model as we use get methods
      if (model instanceof Backbone.Model) {
        state.proposalModel = model
        app.proposal = state.proposalModel
      } else {
        console.log("Store.proposal - unsetting proposal model")
        // Ensure proposal model is unset.
        state.proposalModel = null
        app.proposal = null
      }
    },
    // proposal is a string representation of the currently selected proposal - used heavily in code
    set_proposal(state, prop) {
      if (prop) {
        state.proposal = prop
        sessionStorage.setItem('prop', prop)
      } else {
        state.proposal = ''
        sessionStorage.removeItem('prop')
      }
      // Legacy app
      app.prop = state.proposal
    },
    // Code for the proposal type (mx, xpdf, sm etc.)
    set_proposal_type(state, proposalType) {
      state.proposalType = proposalType
      app.type = state.proposalType
    },
    // Set current visit / session number
    set_visit(state, visit) {
      state.visit = visit
    },
    clear_visit(state) {
      state.visit = ''
    },
  },
  actions: {
    set_proposal({commit, state, rootState}, prop) {
        return new Promise((resolve, reject) => {
          // Only fetch a new model if this one is different from what we have already
          if (prop == state.proposal) { resolve(); return }
          // If null reset (e.g. navigated back to home page)
          if (!prop) {
            commit('set_proposal', null)
            commit('set_proposal_type', rootState.user.defaultType)
            commit('set_proposal_model', null)
            resolve()
            return
          }
          // Otherwise fetch an updated model
          // If we don't do this now - the ProposalModel appends the old proposal code onto the request
          commit('set_proposal', prop)

          let proposalModel = new Proposal({ PROPOSAL: prop })

          proposalModel.fetch({
              success: function() {
                let proposalType = proposalModel.get('TYPE')
                commit('set_proposal_type', proposalType)
                commit('set_proposal_model', proposalModel)
                resolve()
              },

              error: function() {
                commit('addNotification', { title: 'No such proposal', message: 'The selected proposal ' + prop + ' does not exist', level: 'error' })
                commit('set_proposal', null)
                reject()
              },
          })
        })
      },
      //
      // Set the proposal based on looking up a collection/contact id
      // The ProposalLookup backbone model actually calls app.cookie which in turn sets the proposal mutation
      //
      proposal_lookup(state, params) {
        return new Promise((resolve, reject) => {
          let lookup = new ProposalLookup({ field: params.field, value: params.value })

          lookup.find({
              success: function() {
                // If ok then ProposalLookup has set a new proposal for us
                // We might need to do other things here - refresh proposal type?
                console.log(JSON.stringify(lookup))
                resolve(lookup)
              },
              error: function() {
                reject({msg: 'Error looking up proposal from ' + params.field})
              }
          })
        })
      },
  },
  getters: {
    currentProposal: function(state) {
      // If we have no proposal set, check if there is one in storage
      // Should not need to do this now.... TODO - simplify this
      if (!state.proposal) {
        let prop = sessionStorage.getItem('prop')
        if (prop) {
          state.proposal = prop
          app.prop = state.proposal
        } else {
          state.proposal = ''
        }
      }
      return state.proposal
    },
    currentProposalType: state => state.proposalType,
    currentProposalState: state => state.proposalModel ? state.proposalModel.get('STATE'): null
  }
}

export default proposalModule


