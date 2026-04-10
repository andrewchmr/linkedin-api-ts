import { ILinkedInConfig, IErrorHandler } from '../interfaces';

const DEFAULTS = {
  timeout: 10000,
  logging: false,
  delay: 200,
  maxRetries: 3,
} as const;

export class LinkedInConfig {
  private _apiKey: string | undefined;
  readonly proxyUrl: string | undefined;
  readonly timeout: number;
  readonly logging: boolean;
  readonly delay: number;
  readonly maxRetries: number;
  readonly errorHandler: IErrorHandler | undefined;

  constructor(config: ILinkedInConfig = {}) {
    this._apiKey = config.apiKey;
    this.proxyUrl = config.proxyUrl;
    this.timeout = config.timeout ?? DEFAULTS.timeout;
    this.logging = config.logging ?? DEFAULTS.logging;
    this.delay = config.delay ?? DEFAULTS.delay;
    this.maxRetries = config.maxRetries ?? DEFAULTS.maxRetries;
    this.errorHandler = config.errorHandler;
  }

  get apiKey(): string | undefined {
    return this._apiKey;
  }

  set apiKey(value: string | undefined) {
    this._apiKey = value;
  }
}
