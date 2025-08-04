// __mocks__/nextImageMock.js
module.exports = (props) => {
  const { src, alt, ...rest } = props
  return require("react").createElement("img", { src, alt, ...rest })
}
