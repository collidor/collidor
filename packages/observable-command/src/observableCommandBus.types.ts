import type { BasePlugin, Command, COMMAND_RETURN } from "@collidor/command";
import type { Observable } from "rxjs";

export type ObservablePluginHandler<
  C extends Command,
  TContext extends Record<string, any>,
> = (
  command: C,
  context: TContext,
  handler?: (
    command: C,
    context: TContext,
  ) => Observable<C[COMMAND_RETURN]>,
) => Observable<C[COMMAND_RETURN]>;

export interface ObservableCommandBusPlugin<
  C extends Command = Command,
  TContext extends Record<string, any> = Record<string, any>,
> extends BasePlugin<TContext> {
  handler?: ObservablePluginHandler<C, TContext>;
}
