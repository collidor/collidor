import {
  type Command,
  type COMMAND_RETURN,
  CommandBus,
  type CommandBusOptions,
  type Type,
} from "@collidor/command"; // Adjusted import for context
import { from, isObservable, Observable, of } from "rxjs";

type ContextType = Record<string, any>;

export class ObservableCommandBus<TContext extends ContextType = ContextType> {
  protected bus: CommandBus<TContext, any>;
  protected handlers: Map<
    Type<Command>,
    (
      command: Command,
      context: TContext,
      meta?: Record<string, any>,
    ) => Observable<any> | any | Promise<any>
  > = new Map();

  constructor(bus: CommandBus<TContext, any>);
  constructor(options: CommandBusOptions<TContext, any>);
  constructor(
    busOroptions?: CommandBusOptions<TContext, any> | CommandBus<TContext, any>,
  ) {
    if (busOroptions instanceof CommandBus) {
      this.bus = busOroptions as CommandBus<TContext, any>;
    } else {
      this.bus = new CommandBus(busOroptions);
    }
  }

  register<C extends Command>(
    command: Type<C>,
    handler: (
      command: C,
      context: TContext,
      meta?: Record<string, any>,
    ) =>
      | Observable<C[COMMAND_RETURN]>
      | C[COMMAND_RETURN]
      | Promise<C[COMMAND_RETURN]>,
  ) {
    this.handlers.set(command, handler as any);

    // Use registerStream instead of registerStreamAsync
    this.bus.registerStream(command, (cmd, context, next, meta) => {
      const result = handler(cmd, context, meta);

      // 1. Handle Observables
      if (isObservable(result)) {
        const subscription = result.subscribe({
          next: (value) => {
            // Pass data to the CommandBus callback
            next(value, false);
          },
          error: (err) => {
            // Pass error and mark as done
            next(null as any, true, err);
          },
          complete: () => {
            // Mark as done
            next(null as any, true);
          },
        });

        // Return the unsubscribe function for CommandBus to handle teardown
        return () => {
          subscription.unsubscribe();
        };
      }

      // 2. Handle Promises
      if (result instanceof Promise) {
        let isCancelled = false;
        result
          .then((value) => {
            if (!isCancelled) {
              next(value, true); // Single value, then done
            }
          })
          .catch((err) => {
            if (!isCancelled) {
              next(null as any, true, err);
            }
          });
        return () => {
          isCancelled = true;
        };
      }

      // 3. Handle Synchronous Values
      next(result, true);
      return () => {};
    });
  }

  execute<C extends Command>(
    command: C,
    context?: TContext,
  ): Observable<C[COMMAND_RETURN]> {
    const handler = this.handlers.get(command.constructor as Type<Command>);
    if (handler) {
      const result = handler(command, context || (this.bus as any).context);
      if (isObservable(result)) {
        return result;
      } else if (result instanceof Promise) {
        return from(result);
      }
      return of(result);
    }
    return new Observable((subscriber) => {
      // We pass the AbortSignal from the new logic if needed,
      // though RxJS handles unsubscription via the return function.
      const unsubscribe = this.bus.stream(
        command,
        (data, done, error) => {
          if (error) {
            subscriber.error(error);
            return;
          }
          // Standard CommandBus stream behavior:
          // The stream might emit data without being done yet.
          if (data !== undefined && data !== null) {
            subscriber.next(data);
          }

          if (done) {
            subscriber.complete();
          }
        },
        context,
      );

      // Teardown logic
      return () => {
        unsubscribe();
      };
    });
  }
}
