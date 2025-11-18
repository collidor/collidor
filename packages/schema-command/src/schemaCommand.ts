import { Command, COMMAND_RETURN } from "@collidor/command";
import type { z } from "zod";

export class SchemaCommand<
  const TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  const TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
> extends Command<z.infer<TInputSchema>, z.infer<TOutputSchema>> {
  constructor(
    public schema: {
      input: TInputSchema;
      output: TOutputSchema;
    },
    public override data: z.infer<TInputSchema> = schema.input.parse({}),
  ) {
    super(data);
  }
}

export type SchemaCommandType<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
> = Command<z.infer<TInputSchema>, z.infer<TOutputSchema>> & {
  schema: {
    input: TInputSchema;
    output: TOutputSchema;
  };
  data: z.infer<TInputSchema>;
};

export function schemaCommand<
  const TInputSchema extends z.ZodTypeAny,
  const TOutputSchema extends z.ZodTypeAny,
>(
  inputSchema: TInputSchema,
  outputSchema: TOutputSchema,
):
  & (new <R = z.infer<TOutputSchema>, V = z.infer<TInputSchema>>(
    data?: V,
  ) => Command<V, R> & {
    schema: {
      input: TInputSchema;
      output: TOutputSchema;
    };
    data: V;
  })
  & {
    schema: {
      input: TInputSchema;
      output: TOutputSchema;
    };
  } {
  const schema = {
    input: inputSchema,
    output: outputSchema,
  } as const;
  return class extends SchemaCommand<TInputSchema, TOutputSchema> {
    public static schema = schema;
    public override [COMMAND_RETURN]!: z.infer<TOutputSchema>;
    override schema = schema;
    constructor(data: z.infer<TInputSchema>) {
      super(schema, data as z.infer<TInputSchema>);
    }
  } as
    & (new <R = z.infer<TOutputSchema>, V = z.infer<TInputSchema>>(
      data?: V,
    ) => Command<V, R> & {
      schema: {
        input: TInputSchema;
        output: TOutputSchema;
      };
      data: V;
    })
    & {
      schema: {
        input: TInputSchema;
        output: TOutputSchema;
      };
    };
}
