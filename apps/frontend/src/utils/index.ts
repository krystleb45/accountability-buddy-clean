// src/utils/index.ts

// —————————————————————————————————————————
// Core API + HTTP
// —————————————————————————————————————————
export * from './apiUtils';
export * from './http';

// —————————————————————————————————————————
// Storage & environment
// —————————————————————————————————————————
export * from './localStorageUtils';
export * from './env';
export * from './validateFrontendEnv';

// —————————————————————————————————————————
// Data transformations
// —————————————————————————————————————————
export * from './arrayUtils'; // includes sortByKey
export * as dateUtils from './dateUtils'; // namespace for date helpers

export * from './stringUtils';
export * from './numberUtils';
export * from './taskHelpers';
export * from './leaderboardMapper';

// —————————————————————————————————————————
// Error handling & monitoring
// —————————————————————————————————————————
export * from './errorUtils';
export * from './reportWebVitals';

// —————————————————————————————————————————
// Real-time socket helpers
// —————————————————————————————————————————
export { default as socket } from './socket';

// —————————————————————————————————————————
// Avoid the sortByKey name collision
// —————————————————————————————————————————
export { sortByKey as sortArrayByKey } from './arrayUtils';
export { sortByKey as sortDateByKey } from './dateUtils';

// —————————————————————————————————————————
// General utilities bundle
// —————————————————————————————————————————
export { default as generalUtils } from './generalUtils';
