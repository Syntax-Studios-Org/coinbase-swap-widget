/**
 * Performance monitoring utilities for tracking swap flow timing
 */

interface TimingData {
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private timings: Map<string, TimingData> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // Enable in development or when explicitly enabled
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING === 'true';
  }

  /**
   * Start timing an operation
   */
  startTiming(operationId: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.timings.set(operationId, {
      startTime: performance.now(),
      metadata,
    });

    console.log(`🚀 [PERF] Started: ${operationId}`, metadata || '');
  }

  /**
   * End timing an operation and log the duration
   */
  endTiming(operationId: string, metadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;

    const timing = this.timings.get(operationId);
    if (!timing) {
      console.warn(`⚠️ [PERF] No start time found for: ${operationId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - timing.startTime;

    // Update timing data
    timing.endTime = endTime;
    timing.duration = duration;
    if (metadata) {
      timing.metadata = { ...timing.metadata, ...metadata };
    }

    // Log the result with color coding based on duration
    const durationMs = Math.round(duration);
    const emoji = duration < 500 ? '✅' : duration < 1000 ? '⚡' : duration < 2000 ? '⏳' : '🐌';
    
    console.log(`${emoji} [PERF] Completed: ${operationId} - ${durationMs}ms`, {
      duration: durationMs,
      ...timing.metadata,
      ...metadata,
    });

    return duration;
  }

  /**
   * Get timing data for an operation
   */
  getTiming(operationId: string): TimingData | undefined {
    return this.timings.get(operationId);
  }

  /**
   * Get all timing data
   */
  getAllTimings(): Record<string, TimingData> {
    return Object.fromEntries(this.timings);
  }

  /**
   * Clear all timing data
   */
  clearTimings(): void {
    this.timings.clear();
  }

  /**
   * Log a summary of all completed operations
   */
  logSummary(): void {
    if (!this.isEnabled) return;

    const completedTimings = Array.from(this.timings.entries())
      .filter(([_, timing]) => timing.duration !== undefined)
      .sort(([_, a], [__, b]) => (b.duration || 0) - (a.duration || 0));

    if (completedTimings.length === 0) {
      console.log('📊 [PERF] No completed operations to summarize');
      return;
    }

    console.group('📊 [PERF] Performance Summary');
    completedTimings.forEach(([operationId, timing]) => {
      const durationMs = Math.round(timing.duration || 0);
      const emoji = durationMs < 500 ? '✅' : durationMs < 1000 ? '⚡' : durationMs < 2000 ? '⏳' : '🐌';
      console.log(`${emoji} ${operationId}: ${durationMs}ms`);
    });
    
    const totalTime = completedTimings.reduce((sum, [_, timing]) => sum + (timing.duration || 0), 0);
    console.log(`🎯 Total measured time: ${Math.round(totalTime)}ms`);
    console.groupEnd();
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(
    operationId: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(operationId, metadata);
    try {
      const result = await fn();
      this.endTiming(operationId, { success: true });
      return result;
    } catch (error) {
      this.endTiming(operationId, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  measureSync<T>(
    operationId: string, 
    fn: () => T, 
    metadata?: Record<string, any>
  ): T {
    this.startTiming(operationId, metadata);
    try {
      const result = fn();
      this.endTiming(operationId, { success: true });
      return result;
    } catch (error) {
      this.endTiming(operationId, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();

// Export operation IDs as constants for consistency
export const PERF_OPERATIONS = {
  // Quote operations
  QUOTE_FETCH: 'quote-fetch',
  QUOTE_CREATE: 'quote-create',
  QUOTE_PRICE_CHECK: 'quote-price-check',
  
  // Swap operations
  SWAP_EXECUTION: 'swap-execution',
  SWAP_TRANSACTION: 'swap-transaction',
  SWAP_CONFIRMATION: 'swap-confirmation',
  
  // Balance operations
  BALANCE_FETCH: 'balance-fetch',
  BALANCE_REFRESH: 'balance-refresh',
  
  // Network operations
  NETWORK_SWITCH: 'network-switch',
  
  // UI operations
  TOKEN_SELECTION: 'token-selection',
  MODAL_OPEN: 'modal-open',
  
  // API operations
  API_CALL: 'api-call',
  
  // Full flow operations
  FULL_SWAP_FLOW: 'full-swap-flow',
} as const;

export type PerformanceOperation = typeof PERF_OPERATIONS[keyof typeof PERF_OPERATIONS];