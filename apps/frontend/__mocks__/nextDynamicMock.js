// __mocks__/nextDynamicMock.js
module.exports = (fn) => {
  const Component = fn()
  Component.displayName = "DynamicComponent"
  return Component
}
