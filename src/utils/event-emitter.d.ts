export declare class EventEmitter {
  private events: { [key: string]: Function[] };
  
  constructor();
  
  on(event: string, listener: Function): EventEmitter;
  off(event: string, listenerToRemove: Function): EventEmitter;
  emit(event: string, ...args: any[]): EventEmitter;
  once(event: string, listener: Function): EventEmitter;
  removeAllListeners(event?: string): EventEmitter;
  listenerCount(event: string): number;
}

export default EventEmitter;