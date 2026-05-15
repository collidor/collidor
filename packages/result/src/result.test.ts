import { assertEquals } from "@std/assert";
import { Result } from "./result.ts";

Deno.test("Result Basics", async (t) => {
  await t.step("ok() creates successful result", () => {
    const res = Result.ok(42);
    assertEquals(res.success, true);
    assertEquals(res.value, 42);
  });

  await t.step("err() creates failure result", () => {
    const res = Result.err("fail");
    assertEquals(res.success, false);
    assertEquals(res.error, "fail");
  });

  await t.step("none() creates null error result", () => {
    const res = Result.none();
    assertEquals(res.success, false);
    assertEquals(res.error, null);
  });
});

Deno.test("Cross-Context & Structural Logic", async (t) => {
  await t.step("from() identifies Error-like objects structurally", () => {
    // Simulate a serialized error from a worker (not an instance of Error)
    const fakeError = { message: "worker fail", code: 500 };
    const res = Result.from(fakeError);
    assertEquals(res.success, false);
    assertEquals((res as any).error.message, "worker fail");
  });

  await t.step(
    "unwrap() re-hydrates plain objects into Error instances",
    () => {
      const serializedErr = { message: "serialized", stack: "remote-stack" };
      const res = Result.err(serializedErr);

      try {
        Result.unwrap(res);
      } catch (e) {
        assertEquals(e instanceof Error, true);
        assertEquals((e as Error).message, "serialized");
        assertEquals((e as Error).stack?.includes("remote-stack"), true);
      }
    },
  );

  await t.step("isResult() uses structural checks", () => {
    assertEquals(Result.isResult({ success: true, value: 1 }), true);
    assertEquals(Result.isResult({ success: false, error: "!" }), true);
    assertEquals(Result.isResult({ success: true }), false); // Missing value/error key
  });
});

Deno.test("Sync Pipe", () => {
  const res = Result.pipe(
    Result.ok(10),
    (n) => n * 2,
    (n) => Result.ok(n + 5),
  );
  assertEquals(Result.unwrap(res), 25);

  const errFlow = Result.pipe(
    Result.err("fail"),
    (n: number) => n * 2, // Will be skipped
  );
  assertEquals(errFlow.success, false);
});

Deno.test("Async Pipe", async () => {
  const res = await Result.pipeAsync(
    Result.ok(10),
    (n) => Promise.resolve(n * 2),
    (n) => Promise.resolve(Result.ok(n + 5)),
  );
  assertEquals(Result.unwrap(res), 25);

  let errorCaught = false;
  const errorInMiddle = await Result.pipeAsync(
    Result.ok(10),
    () => Result.err("stop"),
    (n) => {
      errorCaught = true; // Should not be reached
      return n + 1;
    },
  );
  assertEquals(errorInMiddle.success, false);
  assertEquals((errorInMiddle as any).error, "stop");
  assertEquals(errorCaught, false);
});

Deno.test("Safety & Fallbacks", async (t) => {
  await t.step("try() captures exceptions", () => {
    const res = Result.try(() => {
      throw new Error("sync crash");
    });
    assertEquals(res.success, false);
    assertEquals((res as any).error.message, "sync crash");
  });

  await t.step("fromPromise() captures rejections", async () => {
    const res = await Result.fromPromise(
      Promise.reject({ message: "async crash" }),
    );
    assertEquals(res.success, false);
    assertEquals(res.error!.message, "async crash");
  });
});
