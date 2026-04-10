import { IErrorHandler } from './IErrorHandler';

export interface ILinkedInConfig {
  apiKey?: string;
  proxyUrl?: string;
  timeout?: number;
  logging?: boolean;
  delay?: number;
  maxRetries?: number;
  errorHandler?: IErrorHandler;
}
