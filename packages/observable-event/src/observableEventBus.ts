import { Observable } from "rxjs";
import { type Event, EventBus } from "@collidor/event";

export type Type<T> = new (...args: any[]) => T;
// Helper type to extract the 'data' type from an Event class
export type EventData<T> = T extends Event<infer D> ? D : never;

export class ObservableEventBus<
  TContext extends Record<string, any> = Record<string, any>,
> {
  protected bus: EventBus<TContext>;

  constructor(bus: EventBus<TContext>);
  constructor(
    options?: { context?: TContext; channel?: any }, // Using 'any' for channel to avoid circular type complexities if not needed strictly
  );
  constructor(
    busOrOptions?:
      | EventBus<TContext>
      | { context?: TContext; channel?: any },
  ) {
    if (busOrOptions instanceof EventBus) {
      this.bus = busOrOptions;
    } else {
      this.bus = new EventBus(busOrOptions);
    }
  }

  /**
   * Returns an Observable that emits data when the specified Event is triggered.
   */
  on<T extends Event<any>>(
    event: Type<T>,
  ): Observable<EventData<T>>;
  /**
   * Returns an Observable that emits data when any of the specified Events are triggered.
   */
  on<T extends Event<any>[]>(
    events: Type<T[number]>[],
  ): Observable<EventData<T[number]>>;
  on<T extends Event<any> | Event<any>[]>(
    eventOrEvents: Type<T> | Type<(T & Array<any>)[number]>[],
  ): Observable<any> {
    return new Observable((subscriber) => {
      // We define the callback that pushes data into the stream
      const callback = (data: any) => {
        subscriber.next(data);
      };

      // Register the listener with the underlying bus.
      // The underlying bus returns a teardown function.
      // We cast to 'any' here because TS struggles to map the generic array union
      // perfectly to the overload, but the runtime logic is identical.
      const off: () => void = this.bus.on(
        eventOrEvents as any,
        callback,
      ) as any as () => void;

      // Return the teardown logic to RxJS
      return () => {
        off();
      };
    });
  }

  /**
   * Emits an event to the underlying bus.
   */
  emit<T extends Event<any>>(event: T, context?: TContext): void {
    this.bus.emit(event, context);
  }
}
