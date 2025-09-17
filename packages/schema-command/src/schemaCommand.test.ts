import { assertExists } from "@std/assert";
import { SchemaCommand } from "./schemaCommand.ts";

Deno.test("schema-command package", () => {
  assertExists(SchemaCommand);
});
