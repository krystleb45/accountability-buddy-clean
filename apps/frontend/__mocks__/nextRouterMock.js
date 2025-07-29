// __mocks__/nextRouterMock.js
module.exports = {
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn(), pathname: '/' }),
  usePathname: () => '/',
};
