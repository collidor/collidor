import { from, Observable, type ObservableInput, type Subscriber } from "rxjs";
import {
  BaseCommandBus,
  type Command,
  type COMMAND_RETURN,
  type Type,
} from "@collidor/command";
import type { ObservableCommandBusPlugin } from "./observableCommandBus.types.ts";

export class ObservableCommandBus<
  TContext extends Record<string, any> = Record<string, any>,
  TPlugin extends ObservableCommandBusPlugin<Command, TContext> | undefined =
    undefined,
> extends BaseCommandBus<TContext, TPlugin> {
  /**
   * Registers a handler that can return an Observable, Promise, or value.
   */
  register<C extends Command>(
    command: Type<C>,
    handler: (
      command: C,
      context: TContext,
      meta?: Record<string, any>,
    ) => ObservableInput<C[COMMAND_RETURN]> | C[COMMAND_RETURN],
  ) {
    this.commandConstructor.set(command.name, command);
    this.handlers.set(command.name, handler as any);

    if (this.plugin?.register) {
      this.plugin.register(command);
    }
  }

  /**
   * Executes a command and guarantees an Observable return.
   */
  execute<C extends Command>(
    command: C,
    context?: TContext,
  ): Observable<C[COMMAND_RETURN]> {
    const handler = this.handlers.get(command.constructor.name);
    const ctx = context ?? this.context;

    // Plugin Interception
    if (this.plugin?.handler) {
      // We assume plugin handler returns Observable or we wrap it
      const result = this.plugin.handler(command, ctx, handler as any);
      return result instanceof Observable ? result : from(result as any);
    }

    if (!handler) {
      return new Observable((obs) => {
        obs.error(
          new Error(`No handler registered for ${command.constructor.name}`),
        );
      });
    }

    // Wrap the result in RxJS 'from' to handle Promises, Observables, and values uniformly
    // Note: 'from' expects an ObservableInput. If it's a primitive value, 'from' might fail
    // depending on RxJS version/config. Safe bet is checking:
    try {
      const result = handler(command, ctx);
      if (result instanceof Observable) return result;
      if (result instanceof Promise) return from(result);
      // It's a synchronous value
      return from([result]);
    } catch (err) {
      return new Observable((obs) => obs.error(err));
    }
  }

  /**
   * observe() wraps the BaseCommandBus stream (callback-based) into an Observable
   */
  observe<C extends Command>(
    command: C,
    context?: TContext,
    abortSignal?: AbortSignal,
  ): Observable<C[COMMAND_RETURN]> {
    return new Observable((subscriber: Subscriber<C[COMMAND_RETURN]>) => {
      const unsubscribe = super.stream(
        command,
        (data, done, error) => {
          if (error) {
            subscriber.error(error);
          } else {
            if (!done) subscriber.next(data);
            else {
              if (data !== undefined) subscriber.next(data);
              subscriber.complete();
            }
          }
        },
        context,
        abortSignal,
      );

      return () => {
        if (unsubscribe) {
          Promise.resolve(unsubscribe).then((f) => f && f());
        }
      };
    });
  }
}
