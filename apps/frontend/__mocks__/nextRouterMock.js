/* eslint-disable react-hooks-extra/no-unnecessary-use-prefix */
module.exports = {
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn(), pathname: "/" }),
  usePathname: () => "/",
}
