import { assertEquals, assertInstanceOf } from "@std/assert";
import { z } from "zod";
import { SchemaCommand, schemaCommand } from "./schemaCommand.ts"; // Adjust path to your file
import { CommandBus } from "@collidor/command";

// Define schemas for testing
const InputSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const OutputSchema = z.object({
  success: z.boolean(),
  id: z.string(),
});

// Create a specific command class using the factory
class CreateUserCommand extends schemaCommand(InputSchema, OutputSchema) {}

Deno.test("schemaCommand - should create a class instance with correct structure", () => {
  const payload = { name: "Alice", age: 30 };
  const command = new CreateUserCommand(payload);

  // Check inheritance
  assertInstanceOf(command, SchemaCommand);

  // Check data
  assertEquals(command.data, payload);

  // Check instance schema properties (New structure: input/output)
  assertEquals(command.schema.input, InputSchema);
  assertEquals(command.schema.output, OutputSchema);
});

Deno.test("schemaCommand - should expose static schema property on the generated class", () => {
  // The new implementation adds a static schema property
  assertEquals(CreateUserCommand.schema.input, InputSchema);
  assertEquals(CreateUserCommand.schema.output, OutputSchema);
});

Deno.test("schemaCommand - should apply Zod default values when instantiated without data", () => {
  const DefaultInput = z.object({
    count: z.number().default(0),
    tag: z.string().default("default"),
  });
  const VoidOutput = z.void();

  const DefaultCommand = schemaCommand(DefaultInput, VoidOutput);

  // Instantiate without arguments
  const command = new DefaultCommand();

  // Should trigger schema.input.parse({}) inside the constructor
  assertEquals(command.data.count, 0);
  assertEquals(command.data.tag, "default");
});

/*
    INTEGRATION WITH COMMAND BUS
*/

Deno.test("commandBus - should register and execute a schemaCommand", () => {
  const commandBus = new CommandBus();

  // logic: Validates input via command, returns mock output
  commandBus.register(CreateUserCommand, (command) => {
    // Verify type inference works here (runtime check)
    assertEquals(command.data.name, "Alice");

    return {
      success: true,
      id: "user_123",
    };
  });

  const result = commandBus.execute(
    new CreateUserCommand({ name: "Alice", age: 30 }),
  );

  assertEquals(result, { success: true, id: "user_123" });
});

Deno.test("commandBus - should handle schemaCommand in streams", async () => {
  const commandBus = new CommandBus();
  const StreamInput = z.object({ limit: z.number() });
  const StreamOutput = z.number(); // Yields numbers

  class NumberStreamCommand extends schemaCommand(StreamInput, StreamOutput) {}

  commandBus.registerStream(NumberStreamCommand, (command, _ctx, next) => {
    for (let i = 0; i < command.data.limit; i++) {
      next(i, i === command.data.limit - 1);
    }
    return () => {};
  });

  const results: number[] = [];
  await new Promise((resolve) => {
    commandBus.stream(
      new NumberStreamCommand({ limit: 5 }),
      (data, done) => {
        results.push(data);
        if (done) resolve(undefined);
      },
    );
  });

  assertEquals(results, [0, 1, 2, 3, 4]);
});
