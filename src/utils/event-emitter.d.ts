type EventListener = (...args: unknown[]) => void;

export declare class EventEmitter {
  private events: { [key: string]: EventListener[] };
  
  constructor();
  
  on(event: string, listener: EventListener): EventEmitter;
  off(event: string, listenerToRemove: EventListener): EventEmitter;
  emit(event: string, ...args: unknown[]): EventEmitter;
  once(event: string, listener: EventListener): EventEmitter;
  removeAllListeners(event?: string): EventEmitter;
  listenerCount(event: string): number;
}

export default EventEmitter;
