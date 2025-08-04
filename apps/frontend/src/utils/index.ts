// src/utils/index.ts

// —————————————————————————————————————————
// Core API + HTTP
// —————————————————————————————————————————
export * from "./apiUtils"
// —————————————————————————————————————————
// Data transformations
// —————————————————————————————————————————
export * from "./arrayUtils" // includes sortByKey

// —————————————————————————————————————————
// Avoid the sortByKey name collision
// —————————————————————————————————————————
export { sortByKey as sortArrayByKey } from "./arrayUtils"
export * as dateUtils from "./dateUtils" // namespace for date helpers
export { sortByKey as sortDateByKey } from "./dateUtils"

export * from "./env"
// —————————————————————————————————————————
// Error handling & monitoring
// —————————————————————————————————————————
export * from "./errorUtils"

// —————————————————————————————————————————
// General utilities bundle
// —————————————————————————————————————————
export { default as generalUtils } from "./generalUtils"
export * from "./http"
export * from "./leaderboardMapper"
// —————————————————————————————————————————
// Storage & environment
// —————————————————————————————————————————
export * from "./localStorageUtils"

export * from "./numberUtils"
export * from "./reportWebVitals"

// —————————————————————————————————————————
// Real-time socket helpers
// —————————————————————————————————————————
export { default as socket } from "./socket"

export * from "./stringUtils"
export * from "./taskHelpers"

export * from "./validateFrontendEnv"
