import { assertEquals, assertThrows } from "@std/assert";
import { Result } from "./result.ts";

Deno.test("should create and handle Result types", async (t) => {
  await t.step("should create and handle Result.ok", () => {
    const okResult = Result.ok(42);
    assertEquals(okResult, { success: true, value: 42 });
  });

  await t.step("should create and handle Result.err and Result.none", () => {
    const errResult = Result.err("An error occurred");
    assertEquals(errResult, { success: false, error: "An error occurred" });
  });

  await t.step("should create and handle Result.none", () => {
    const noneResult = Result.none<number>();
    assertEquals(noneResult.value, undefined);
    assertEquals(noneResult.success, false);
  });
});

Deno.test("should identify Result types correctly", () => {
  const okResult = Result.ok(42);
  const errResult = Result.err("An error occurred");
  const notAResult = { foo: "bar" };

  assertEquals(Result.isResult(okResult), true);
  assertEquals(Result.isResult(errResult), true);
  assertEquals(Result.isResult(notAResult), false);
});

Deno.test("should convert values and promises to Result types", async (t) => {
  await t.step("should convert value to Result", () => {
    const fromValue = Result.from(42);
    assertEquals(fromValue, { success: true, value: 42 });
  });

  await t.step("should convert Error to Result", () => {
    const error = new Error("An error occurred");
    const fromError = Result.from(error);
    assertEquals(fromError, {
      success: false,
      error,
    });
  });

  await t.step("should convert resolved promise to Result", async () => {
    const fromResolvedPromise = await Result.fromPromise(Promise.resolve(42));
    assertEquals(fromResolvedPromise, { success: true, value: 42 });
  });

  await t.step("should convert rejected promise to Result", async () => {
    const error = new Error("Promise rejected");
    const fromRejectedPromise = await Result.fromPromise(
      Promise.reject(error),
    );
    assertEquals(fromRejectedPromise, {
      success: false,
      error,
    });
  });
});

Deno.test("should unwrap Result types correctly", async (t) => {
  await t.step("should unwrap an Err Result and throw the error", () => {
    const error = new Error("An error occurred");
    const errResult = Result.err(error);
    try {
      Result.unwrap(errResult);
    } catch (e) {
      assertEquals(e, error);
      return;
    }
  });

  await t.step("should throw if Result is undefined", () => {
    assertThrows(
      () => Result.unwrap(undefined as any),
      Error,
      "Result is undefined",
    );
  });

  await t.step("should return the value if input is not a Result", () => {
    const value = 42;
    const unwrappedValue = Result.unwrap(value as any);
    assertEquals(unwrappedValue, 42);
  });

  await t.step("should unwrap an Ok Result and return the value", () => {
    const okResult = Result.ok(42);
    const unwrappedValue = Result.unwrap(okResult);
    assertEquals(unwrappedValue, 42);
  });
});
