import { Command, COMMAND_RETURN } from "@collidor/command";
import type { z } from "zod";

export class SchemaCommand<
  const Z extends z.ZodTypeAny = z.ZodTypeAny,
  R = any,
> extends Command<z.infer<Z>, R> {
  constructor(
    public schema: Z,
    public override data: z.infer<Z> = schema.parse({}),
  ) {
    super(data);
  }
}

export type SchemaCommandType<
  Z extends z.ZodTypeAny = z.ZodTypeAny,
  R = any,
> = Command<z.infer<Z>, R> & { schema: Z; data: z.infer<Z> };

export function schemaCommand<const Z extends z.ZodTypeAny>(
  schema: Z,
): new <R = any, V = z.infer<Z>>(
  data?: V,
) => Command<V, R> & { schema: Z; data: V } {
  return class<R = any, V = z.infer<Z>> extends SchemaCommand<Z> {
    public override [COMMAND_RETURN]!: R;
    override schema = schema;
    constructor(data: V) {
      super(schema, data as z.infer<Z>);
    }
  } as new <R = any, V = z.infer<Z>>(
    data?: V,
  ) => Command<V, R> & { schema: Z; data: V };
}
