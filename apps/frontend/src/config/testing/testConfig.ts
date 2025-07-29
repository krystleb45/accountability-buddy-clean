// src/config/testing/testConfig.ts

/** Allowed test environments */
export enum TestEnvironment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

/** Allowed logging levels */
export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Debug = 'debug',
}

/** Shape of our test configuration */
export interface TestConfig {
  readonly testEnvironment: TestEnvironment;
  readonly apiBaseUrl: string;
  readonly timeout: number;
  readonly logLevel: LogLevel;
}

/**
 * Read from process.env and build a fresh TestConfig.
 * Use this at the top of each test suite to get the current settings.
 */
export function getTestConfig(): TestConfig {
  const env = (process.env.TEST_ENV as TestEnvironment) ?? TestEnvironment.Development;
  const base = process.env.TEST_API_BASE_URL ?? 'http://localhost:5000';
  const to = parseInt(process.env.TEST_REQUEST_TIMEOUT ?? '10000', 10);
  const lvl = (process.env.TEST_LOG_LEVEL as LogLevel) ?? LogLevel.Info;

  return Object.freeze({
    testEnvironment: env,
    apiBaseUrl: base,
    timeout: to,
    logLevel: lvl,
  });
}

/**
 * Return a new config with a different environment,
 * without mutating the original.
 */
export function withEnvironment(cfg: TestConfig, env: TestEnvironment): TestConfig {
  return Object.freeze({
    ...cfg,
    testEnvironment: env,
  });
}

/**
 * Return a new config with a different log level,
 * without mutating the original.
 */
export function withLogLevel(cfg: TestConfig, lvl: LogLevel): TestConfig {
  return Object.freeze({
    ...cfg,
    logLevel: lvl,
  });
}

// Example usage in tests:
//
// import { getTestConfig, withEnvironment, TestEnvironment, LogLevel } from '@/config/testing/testConfig';
//
// const baseCfg = getTestConfig();
// const staging = withEnvironment(baseCfg, TestEnvironment.Staging);
// const debug   = withLogLevel(baseCfg, LogLevel.Debug);
//
// console.log(baseCfg, staging, debug);
