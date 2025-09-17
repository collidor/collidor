import { assertExists } from "@std/assert";

Deno.test("collidor package", async (t) => {
  await t.step("should import all sub-packages", async () => {
    const { Command } = await import("@collidor/command");
    const { EventBus } = await import("@collidor/event");
    const { Injector } = await import("@collidor/injector");

    assertExists(Command);
    assertExists(EventBus);
    assertExists(Injector);
  });
});
