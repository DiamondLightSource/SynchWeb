import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { expect } from 'chai';
import motd from '../../../../src/js/app/components/motd';

const localVue = createLocalVue();
localVue.use(Vuex);

function setupComponent(msg) {
    const wrapper = shallowMount(motd,
        {
            propsData: { message: msg }
        }
    );
    return { wrapper, msg };
}

describe('motd', () => {

    it('displays nothing if message not set', () => {
        const wrapper = shallowMount(motd);
        expect(wrapper.findAll('div').length).to.equal(1);
        expect(wrapper.findAll('p').length).to.equal(0);
        expect(wrapper.text()).to.equal("");
    })

    it('displays nothing if message is set to empty string', () => {
        const { wrapper, msg } = setupComponent("");
        expect(wrapper.findAll('div').length).to.equal(1);
        expect(wrapper.findAll('p').length).to.equal(0);
        expect(wrapper.text()).to.equal(msg);
    })

    it('displays set message correctly', () => {
        const { wrapper, msg } = setupComponent("This is the message of the day...");
        expect(wrapper.findAll('p').length).to.equal(1);
        expect(wrapper.findAll('p').at(0).text()).to.equal(msg);
    })

    it('stores set message correctly in state', () => {
        const { wrapper, msg } = setupComponent("This is the message of the day...");
        expect(wrapper.text()).to.equal(msg);
    })

    it('closes when closed is true', async () => {
        const { wrapper, msg } = setupComponent("This is the message of the day...");
        wrapper.setData({closed: true});
        expect(wrapper.vm.closed).to.equal(true);
        await wrapper.vm.$nextTick()
        expect(wrapper.findAll('div').length).to.equal(1);
        expect(wrapper.findAll('p').length).to.equal(0);
    })

    it('initially set to not closed', () => {
        const { wrapper } = setupComponent("This is the message of the day...");
        expect(wrapper.vm.closed).to.equal(false);
    })

    it('closes when clicked', async () => {
        const { wrapper, msg } = setupComponent("This is the message of the day...");
        expect(wrapper.findAll('p').at(0).text()).to.equal(msg);
        const input = wrapper.find('i')
        input.trigger('click');
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.closed).to.equal(true);
        expect(wrapper.findAll('p').length).to.equal(0);
    })
})
