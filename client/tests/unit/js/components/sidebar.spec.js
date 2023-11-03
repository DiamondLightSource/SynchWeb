import Vuex from "vuex";
import Vue from "vue";
import VueRouter from "vue-router";
import { expect } from "@jest/globals";

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Sidebar from "../../../../src/js/app/components/sidebar.vue";

describe("Sidebar", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  localVue.use(VueRouter);
  localVue.prototype.$store = new Vuex.Store({
    getters: {
      "auth/isLoggedIn": () => {
        return false;
      },
    },
  });

  it("showMenu initially false", () => {
    const wrapper = shallowMount(Sidebar, {
      localVue,
    });
    expect(wrapper.vm.showMenu).toBe(false);
  });

  it("isLoggedIn initially false (via mock)", () => {
    // This is an example testing the isLoggedIn function in the component which is calling into the store and uses the mocked getter above for the store
    const wrapper = shallowMount(Sidebar, {
      localVue,
    });
    expect(wrapper.vm.isLoggedIn).toBe(false);
  });

  it("isProposalClosed returns true if proposal is Closed", () => {
    localVue.prototype.$store.getters["proposal/currentProposalState"] = "Closed";
    const wrapper = shallowMount(Sidebar, {
      localVue,
    });
    expect(wrapper.vm.isProposalClosed).toBe(true);
  });

  it("isProposalClosed returns false if proposal is not Closed", () => {
    localVue.prototype.$store.getters["proposal/currentProposalState"] = "anything else";
    const wrapper = shallowMount(Sidebar, {
      localVue,
    });
    expect(wrapper.vm.isProposalClosed).toBe(false);
  });

  it("extras initially empty without proposal", () => {
    const wrapper = shallowMount(Sidebar, {
      localVue,
    });
    expect(wrapper.vm.extras).toEqual([]);
  });

  it("extras show data if proposal available", async () => {
    localVue.prototype.$store.getters["proposal/currentProposal"] = "proposal xyz";
    const extras = new Array({ name: 1, link: "/aa" });
    const wrapper = shallowMount(Sidebar, {
      propsData: { extrasMenu: extras },
      localVue,
    });
    expect(wrapper.vm.extras).toBe(extras);
  });

  it("extras show data if proposal available and copes with invalidly formatted data", async () => {
    localVue.prototype.$store.getters["proposal/currentProposal"] = "proposal xyz";
    const extras = new Array(1, 2, 3);
    const wrapper = shallowMount(Sidebar, {
      propsData: { extrasMenu: extras },
      localVue,
    });
    expect(wrapper.vm.extras).toBe(extras);
  });
});