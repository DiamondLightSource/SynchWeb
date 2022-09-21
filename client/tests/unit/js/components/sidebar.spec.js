import Vuex from 'vuex'
import Vue from 'vue';
import VueRouter from 'vue-router';
import { expect } from 'chai';

import { shallowMount, createLocalVue } from '@vue/test-utils'
import Sidebar from '../../../../src/js/app/components/sidebar'
   
Vue.use(VueRouter);

describe('Sidebar', () => {

    const localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.prototype.$store = new Vuex.Store({
        getters: {
            'auth/isLoggedIn': () => { return false },
        }}
    )


    it('showMenu initially false', () => {
        const wrapper = shallowMount(Sidebar,
            {
                localVue
            }
        );
        expect(wrapper.vm.showMenu).to.equal(false);
    })

    it('isLoggedIn initially false (via mock)', () => {
        const wrapper = shallowMount(Sidebar,
            {
                localVue
            }
        );
        expect(wrapper.vm.isLoggedIn).to.equal(false); // NB, this is not testing anything more than the mocked getter above - but demonstrates how to do this
    })

    it('isProposalClosed returns true if proposal is Closed', () => {
        localVue.prototype.$store.getters['proposal/currentProposalState'] = 'Closed'
        const wrapper = shallowMount(Sidebar,
            {
                localVue
            }
        );
        expect(wrapper.vm.isProposalClosed).to.equal(true);
    })

    it('isProposalClosed returns false if proposal is not Closed', () => {
        localVue.prototype.$store.getters['proposal/currentProposalState'] = 'anything else'
        const wrapper = shallowMount(Sidebar,
            {
                localVue
            }
        );
        expect(wrapper.vm.isProposalClosed).to.equal(false);
    })

    it('extras initially empty without proposal', () => {
        const wrapper = shallowMount(Sidebar,
            {
                localVue
            }
        );
        expect(wrapper.vm.extras).to.eql([]);
    })

    it('extras show data if proposal available', async () => {
        localVue.prototype.$store.getters['proposal/currentProposal'] = 'proposal xyz'
        const extras = new Array({ name : 1, link : '/aa' });
        const wrapper = shallowMount(Sidebar,
            {
                propsData: { extrasMenu: extras},
                localVue
            }
        );
        expect(wrapper.vm.extras).to.equal(extras);
    })

    it('extras show data if proposal available and copes with invalidly formatted data', async () => {
        localVue.prototype.$store.getters['proposal/currentProposal'] = 'proposal xyz'
        const extras = new Array(1,2,3);
        const wrapper = shallowMount(Sidebar,
            {
                propsData: { extrasMenu: extras},
                localVue
            }
        );
        expect(wrapper.vm.extras).to.equal(extras);
    })
  })