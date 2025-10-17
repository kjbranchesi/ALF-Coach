/**
 * Cloud Errors
 * Comprehensive error types for Firebase operations with detailed context
 */

export enum CloudErrorCode {
  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_TIMEOUT = 'AUTH_TIMEOUT',
  AUTH_INVALID = 'AUTH_INVALID',

  // Network errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',

  // Storage errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  STORAGE_DOWNLOAD_FAILED = 'STORAGE_DOWNLOAD_FAILED',
  STORAGE_DELETE_FAILED = 'STORAGE_DELETE_FAILED',

  // Firestore errors
  FIRESTORE_PERMISSION_DENIED = 'FIRESTORE_PERMISSION_DENIED',
  FIRESTORE_WRITE_FAILED = 'FIRESTORE_WRITE_FAILED',
  FIRESTORE_READ_FAILED = 'FIRESTORE_READ_FAILED',
  FIRESTORE_DOCUMENT_TOO_LARGE = 'FIRESTORE_DOCUMENT_TOO_LARGE',
  FIRESTORE_BATCH_FAILED = 'FIRESTORE_BATCH_FAILED',

  // Data errors
  DATA_SERIALIZATION_FAILED = 'DATA_SERIALIZATION_FAILED',
  DATA_VALIDATION_FAILED = 'DATA_VALIDATION_FAILED',
  DATA_TOO_LARGE = 'DATA_TOO_LARGE',

  // Operation errors
  OPERATION_ABORTED = 'OPERATION_ABORTED',
  OPERATION_RETRY_EXHAUSTED = 'OPERATION_RETRY_EXHAUSTED',
  OPERATION_UNKNOWN = 'OPERATION_UNKNOWN',
}

export interface CloudErrorContext {
  operation: string;
  projectId?: string;
  userId?: string;
  attemptNumber?: number;
  maxAttempts?: number;
  dataSize?: number;
  timestamp: string;
  [key: string]: any;
}

export class CloudError extends Error {
  public readonly code: CloudErrorCode;
  public readonly context: CloudErrorContext;
  public readonly isRetryable: boolean;
  public readonly userMessage: string;
  public readonly originalError?: Error;

  constructor(
    code: CloudErrorCode,
    message: string,
    context: Partial<CloudErrorContext>,
    options?: {
      isRetryable?: boolean;
      userMessage?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'CloudError';
    this.code = code;
    this.context = {
      operation: 'unknown',
      timestamp: new Date().toISOString(),
      ...context,
    };
    this.isRetryable = options?.isRetryable ?? this.determineRetryability(code);
    this.userMessage = options?.userMessage ?? this.generateUserMessage(code);
    this.originalError = options?.originalError;

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CloudError);
    }
  }

  private determineRetryability(code: CloudErrorCode): boolean {
    const retryableCodes = [
      CloudErrorCode.NETWORK_OFFLINE,
      CloudErrorCode.NETWORK_TIMEOUT,
      CloudErrorCode.NETWORK_UNAVAILABLE,
      CloudErrorCode.AUTH_TIMEOUT,
      CloudErrorCode.STORAGE_UPLOAD_FAILED,
      CloudErrorCode.FIRESTORE_WRITE_FAILED,
    ];
    return retryableCodes.includes(code);
  }

  private generateUserMessage(code: CloudErrorCode): string {
    const messages: Record<CloudErrorCode, string> = {
      [CloudErrorCode.AUTH_REQUIRED]: 'Please sign in to sync your project to the cloud.',
      [CloudErrorCode.AUTH_TIMEOUT]: 'Authentication took too long. Please try again.',
      [CloudErrorCode.AUTH_INVALID]: 'Your session has expired. Please sign in again.',

      [CloudErrorCode.NETWORK_OFFLINE]: 'You are offline. Changes will sync when you reconnect.',
      [CloudErrorCode.NETWORK_TIMEOUT]: 'Network connection timed out. Retrying...',
      [CloudErrorCode.NETWORK_UNAVAILABLE]: 'Unable to connect to cloud services. Please check your connection.',

      [CloudErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Cloud storage quota exceeded. Please free up space or upgrade your plan.',
      [CloudErrorCode.STORAGE_UPLOAD_FAILED]: 'Failed to upload files to cloud storage. Retrying...',
      [CloudErrorCode.STORAGE_DOWNLOAD_FAILED]: 'Failed to download files from cloud storage.',
      [CloudErrorCode.STORAGE_DELETE_FAILED]: 'Failed to delete cloud files.',

      [CloudErrorCode.FIRESTORE_PERMISSION_DENIED]: 'You do not have permission to access this project.',
      [CloudErrorCode.FIRESTORE_WRITE_FAILED]: 'Failed to save to cloud database. Retrying...',
      [CloudErrorCode.FIRESTORE_READ_FAILED]: 'Failed to load from cloud database.',
      [CloudErrorCode.FIRESTORE_DOCUMENT_TOO_LARGE]: 'Project data is too large. Consider reducing content size.',
      [CloudErrorCode.FIRESTORE_BATCH_FAILED]: 'Failed to save multiple items. Retrying...',

      [CloudErrorCode.DATA_SERIALIZATION_FAILED]: 'Failed to prepare data for cloud sync.',
      [CloudErrorCode.DATA_VALIDATION_FAILED]: 'Project data is invalid and cannot be synced.',
      [CloudErrorCode.DATA_TOO_LARGE]: 'Project data exceeds maximum size limit.',

      [CloudErrorCode.OPERATION_ABORTED]: 'Operation was cancelled.',
      [CloudErrorCode.OPERATION_RETRY_EXHAUSTED]: 'Maximum retry attempts reached. Please try again later.',
      [CloudErrorCode.OPERATION_UNKNOWN]: 'An unexpected error occurred.',
    };

    return messages[code] || 'An error occurred during cloud sync.';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      context: this.context,
      isRetryable: this.isRetryable,
      stack: this.stack,
    };
  }
}

// Convenience factory functions
export class CloudErrorFactory {
  static authRequired(operation: string, context?: Partial<CloudErrorContext>): CloudError {
    return new CloudError(
      CloudErrorCode.AUTH_REQUIRED,
      'User authentication required for cloud sync',
      { operation, ...context }
    );
  }

  static networkOffline(operation: string, context?: Partial<CloudErrorContext>): CloudError {
    return new CloudError(
      CloudErrorCode.NETWORK_OFFLINE,
      'Network connection unavailable',
      { operation, ...context }
    );
  }

  static quotaExceeded(operation: string, dataSize?: number, context?: Partial<CloudErrorContext>): CloudError {
    return new CloudError(
      CloudErrorCode.STORAGE_QUOTA_EXCEEDED,
      'Storage quota exceeded',
      { operation, dataSize, ...context },
      { isRetryable: false }
    );
  }

  static documentTooLarge(operation: string, dataSize: number, context?: Partial<CloudErrorContext>): CloudError {
    return new CloudError(
      CloudErrorCode.FIRESTORE_DOCUMENT_TOO_LARGE,
      `Document size ${dataSize} bytes exceeds Firestore limit`,
      { operation, dataSize, ...context },
      { isRetryable: false }
    );
  }

  static fromFirebaseError(error: any, operation: string, context?: Partial<CloudErrorContext>): CloudError {
    // Map Firebase error codes to CloudError codes
    const code = error?.code || '';

    if (code === 'permission-denied' || code.includes('permission')) {
      return new CloudError(
        CloudErrorCode.FIRESTORE_PERMISSION_DENIED,
        error.message,
        { operation, ...context },
        { originalError: error, isRetryable: false }
      );
    }

    if (code === 'unauthenticated') {
      return new CloudError(
        CloudErrorCode.AUTH_REQUIRED,
        error.message,
        { operation, ...context },
        { originalError: error }
      );
    }

    if (code === 'quota-exceeded' || code.includes('quota')) {
      return new CloudError(
        CloudErrorCode.STORAGE_QUOTA_EXCEEDED,
        error.message,
        { operation, ...context },
        { originalError: error, isRetryable: false }
      );
    }

    if (code === 'unavailable' || code === 'deadline-exceeded') {
      return new CloudError(
        CloudErrorCode.NETWORK_TIMEOUT,
        error.message,
        { operation, ...context },
        { originalError: error }
      );
    }

    // Generic network errors
    if (code.includes('network') || code.includes('offline')) {
      return new CloudError(
        CloudErrorCode.NETWORK_UNAVAILABLE,
        error.message,
        { operation, ...context },
        { originalError: error }
      );
    }

    // Default unknown error
    return new CloudError(
      CloudErrorCode.OPERATION_UNKNOWN,
      error.message || 'Unknown error occurred',
      { operation, ...context },
      { originalError: error, isRetryable: true }
    );
  }
}

// Error telemetry (can be extended to send to analytics)
export class CloudErrorTelemetry {
  private static errors: CloudError[] = [];
  private static readonly MAX_STORED_ERRORS = 100;

  static record(error: CloudError): void {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_STORED_ERRORS);
    }

    // Log for debugging
    console.error(`[CloudError] ${error.code}:`, {
      message: error.message,
      context: error.context,
      isRetryable: error.isRetryable,
    });

    // TODO: Send to analytics service
    // analytics.logError(error.toJSON());
  }

  static getRecentErrors(limit: number = 10): CloudError[] {
    return this.errors.slice(-limit);
  }

  static getErrorsByCode(code: CloudErrorCode): CloudError[] {
    return this.errors.filter(e => e.code === code);
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getErrorStats(): Record<CloudErrorCode, number> {
    const stats: Partial<Record<CloudErrorCode, number>> = {};
    for (const error of this.errors) {
      stats[error.code] = (stats[error.code] || 0) + 1;
    }
    return stats as Record<CloudErrorCode, number>;
  }
}
