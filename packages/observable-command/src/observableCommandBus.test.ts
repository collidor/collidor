import { assertEquals, assertRejects } from "@std/assert";
import { spy } from "@std/testing/mock";
import { Observable, of, throwError, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import { ObservableCommandBus } from "./observableCommandBus.ts";
import { Command } from "@collidor/command";

class TestCommand extends Command<number, number> {}

Deno.test("ObservableCommandBus - should execute observable handler and emit values", async () => {
  const bus = new ObservableCommandBus();

  // Register a handler that returns an RxJS Observable
  bus.register(TestCommand, (command) => {
    return of(1, 2, 3).pipe(
      map((val) => val * command.data), // 1*10, 2*10, 3*10
    );
  });

  const result: number[] = [];

  // execute() returns an Observable
  await new Promise<void>((resolve, reject) => {
    bus.execute(new TestCommand(10)).subscribe({
      next: (val) => result.push(val),
      error: reject,
      complete: resolve,
    });
  });

  assertEquals(result, [10, 20, 30]);
});

Deno.test("ObservableCommandBus - should propagate errors from Observable", async () => {
  const bus = new ObservableCommandBus();

  bus.register(TestCommand, () => {
    return throwError(() => new Error("RxJS Error"));
  });

  const commandPromise = new Promise((_, reject) => {
    bus.execute(new TestCommand(1)).subscribe({
      error: (err) => reject(err),
      complete: () => reject(new Error("Should have failed")),
    });
  });

  await assertRejects(
    () => commandPromise,
    Error,
    "RxJS Error",
  );
});

Deno.test("ObservableCommandBus - should correctly tear down source Observable on unsubscribe", async () => {
  const bus = new ObservableCommandBus();
  const teardownSpy = spy();

  // 1. Register a command with a manual Observable that tracks teardown
  bus.register(TestCommand, () => {
    return new Observable((subscriber) => {
      const interval = setInterval(() => {
        subscriber.next(1);
      }, 10);

      // This teardown logic MUST be called when the bus unsubscribes
      return () => {
        clearInterval(interval);
        teardownSpy();
      };
    });
  });

  // 2. Start the stream
  const subscription = bus.execute(new TestCommand(0)).subscribe();

  // Allow it to run briefly
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 3. Unsubscribe from the RESULT observable
  subscription.unsubscribe();

  await new Promise((resolve) => setTimeout(resolve, 0));

  // 4. Verify the SOURCE observable was torn down
  assertEquals(
    teardownSpy.calls.length,
    1,
    "Source observable teardown should be called exactly once",
  );
});

Deno.test("ObservableCommandBus - should handle Promise handlers seamlessly", async () => {
  const bus = new ObservableCommandBus();

  // Handler returns a Promise instead of an Observable
  bus.register(TestCommand, async (cmd) => {
    await new Promise((r) => setTimeout(r, 10));
    return cmd.data * 2;
  });

  const result: number[] = [];

  await new Promise<void>((resolve) => {
    bus.execute(new TestCommand(21)).subscribe({
      next: (val) => result.push(val),
      complete: resolve,
    });
  });

  assertEquals(result, [42]);
});

Deno.test("ObservableCommandBus - should handle synchronous values seamlessly", async () => {
  const bus = new ObservableCommandBus();

  // Handler returns a raw value
  bus.register(TestCommand, (cmd) => cmd.data + 1);

  const result: number[] = [];

  await new Promise<void>((resolve) => {
    bus.execute(new TestCommand(1)).subscribe({
      next: (val) => result.push(val),
      complete: resolve,
    });
  });

  assertEquals(result, [2]);
});

Deno.test("ObservableCommandBus - should support RxJS operators", async () => {
  const bus = new ObservableCommandBus();

  // A long running command
  bus.register(TestCommand, () => {
    return timer(0, 10).pipe(
      take(5), // Should emit 0, 1, 2, 3, 4 then complete
    );
  });

  const results: number[] = [];

  await new Promise<void>((resolve) => {
    bus.execute(new TestCommand(0)).subscribe({
      next: (v) => results.push(v),
      complete: resolve,
    });
  });

  assertEquals(results, [0, 1, 2, 3, 4]);
});

Deno.test("ObservableCommandBus - observe() should wrap BaseCommandBus stream", async () => {
  const bus = new ObservableCommandBus();

  // Use registerStream (from BaseCommandBus) for callback-based logic
  bus.registerStream(TestCommand, (cmd, _ctx, next) => {
    let i = 0;
    // Emit 3 values then complete
    const id = setInterval(() => {
      if (i < 3) {
        next(cmd.data + i, false);
        i++;
      } else {
        next(undefined as any, true);
        clearInterval(id);
      }
    }, 10);
    return () => clearInterval(id);
  });

  const results: number[] = [];

  // Use .observe() to get an Observable from the callback stream
  await new Promise<void>((resolve, reject) => {
    bus.observe(new TestCommand(10)).subscribe({
      next: (v) => results.push(v),
      error: reject,
      complete: resolve,
    });
  });

  assertEquals(results, [10, 11, 12]);
});

Deno.test("ObservableCommandBus - observe() should respect AbortSignal", async () => {
  const bus = new ObservableCommandBus();
  const teardownSpy = spy();

  bus.registerStream(TestCommand, (_cmd, _ctx, next) => {
    const id = setInterval(() => next(1, false), 10);
    return () => {
      clearInterval(id);
      teardownSpy();
    };
  });

  const ac = new AbortController();
  const sub = bus.observe(new TestCommand(0), {}, ac.signal).subscribe();

  await new Promise((r) => setTimeout(r, 50));

  ac.abort(); // Trigger abort from signal

  await new Promise((r) => setTimeout(r, 20));

  assertEquals(teardownSpy.calls.length, 1);
  sub.unsubscribe();
});
