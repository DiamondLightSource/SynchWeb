import Vuex from "vuex";
import { expect, jest, test } from "@jest/globals";

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Login from "../../../../src/js/app/views/login.vue";

const originalLocation = window.location;

const mockToken = jest.fn();

const mockRouter = {
  push: jest.fn(),
};

describe("Login", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  localVue.prototype.$store = new Vuex.Store({
    getters: {
      sso: () => true,
      apiUrl: () => "authUrl.co.uk",
    },
    actions: {
      "auth/checkAuth": () => new Promise((resolve) => {
          resolve(false)
      }),
        "auth/getToken": () => new Promise((resolve) => {
          resolve(true)
      }),
    },
  });

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, assign: jest.fn(), href: "http://localhost/login" },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { value: originalLocation, configurable: true });
  });

  it("should redirect to SSO login when unauthorised", async () => {
    const wrapper = shallowMount(Login, {
      localVue,
    });

    await wrapper.vm.$nextTick();

    expect(window.location.assign).toBeCalledWith("authUrl.co.uk/authenticate/authorise");
  });

  it("should not redirect if code is in URL", async () => {
    const mockPush = jest.fn();
    window.location.assign = jest.fn();
    window.location.href = "http://localhost/login?code=testcode";

    const wrapper = shallowMount(Login, {
      mocks: {
        $router: {
          push: mockPush,
        },
      },
      localVue,
    });

    await wrapper.vm.$nextTick();

    expect(window.location.assign).not.toBeCalled();
    expect(mockPush).toBeCalled();
  });

  it("should display login form if SSO is disabled", () => {
    const store = new Vuex.Store({
      getters: {
        sso: () => false,
      },
    });

    const wrapper = shallowMount(Login, {
      store,
      localVue,
    });

    expect(wrapper.find('[data-testid="username"]')).toBeTruthy();
    expect(wrapper.find('[data-testid="password"]')).toBeTruthy();
  });
});