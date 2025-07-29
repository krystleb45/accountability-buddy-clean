// config/features/featureFlags.ts

/**
 * A flat list of all “stable” flags,
 * excluding `experimental.*`.
 */
export type StableFlagName =
  | 'enableBetaFeatures'
  | 'showNewDashboard'
  | 'enableDarkMode'
  | 'enableAnalytics'
  | 'enableMultiLanguageSupport';

/**
 * All experimental flags live here.
 */
export interface ExperimentalFlags {
  enableTaskAutomation: boolean;
  enableAIRecommendations: boolean;
  /** future flags… */
  [key: string]: boolean;
}

export interface FeatureFlags {
  // stable flags
  enableBetaFeatures: boolean;
  showNewDashboard: boolean;
  enableDarkMode: boolean;
  enableAnalytics: boolean;
  enableMultiLanguageSupport: boolean;

  // grouped experimental flags
  experimental: ExperimentalFlags;

  /** is a stable feature on? */
  isFeatureEnabled(name: StableFlagName): boolean;

  /** is an experimental feature on? */
  isExperimentalFlagOn(name: keyof ExperimentalFlags): boolean;
}

const featureFlags: FeatureFlags = {
  enableBetaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
  showNewDashboard: process.env.NEXT_PUBLIC_SHOW_NEW_DASHBOARD === 'true',
  enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableMultiLanguageSupport: process.env.NEXT_PUBLIC_ENABLE_MULTI_LANGUAGE === 'true',

  experimental: {
    enableTaskAutomation: process.env.NEXT_PUBLIC_ENABLE_TASK_AUTOMATION === 'true',
    enableAIRecommendations: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS === 'true',
  },

  isFeatureEnabled(name) {
    return Boolean(this[name]);
  },

  isExperimentalFlagOn(name) {
    return Boolean(this.experimental[name]);
  },
};

export default featureFlags;
