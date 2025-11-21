import { assertEquals, assertRejects } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { Observable, of, Subject, throwError, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import { Command, CommandBus } from "@collidor/command";
import { ObservableCommandBus } from "./observableCommandBus.ts"; // Assuming your file name

class TestCommand extends Command<number, number> {}
class OtherCommand extends Command<string, string> {}

Deno.test("ObservableCommandBus - Shortcut Optimization", async (t) => {
  await t.step(
    "should use direct handler (shortcut) when registered via ObservableCommandBus",
    async () => {
      const internalBus = new CommandBus();
      // Spy on the underlying bus.stream method to ensure it's NOT called
      const streamSpy = spy(internalBus, "stream");

      const bus = new ObservableCommandBus(internalBus);

      bus.register(TestCommand, (cmd) => of(cmd.data * 2));

      const result = await new Promise<number>((resolve) => {
        bus.execute(new TestCommand(10)).subscribe(resolve);
      });

      assertEquals(result, 20);
      // Crucial check: explicit registration should bypass internalBus.stream
      assertSpyCalls(streamSpy, 0);
    },
  );

  await t.step(
    "should fallback to underlying bus if handler not found locally",
    async () => {
      const internalBus = new CommandBus();
      const streamSpy = spy(internalBus, "stream");
      const bus = new ObservableCommandBus(internalBus);

      // Register on the UNDERLYING bus directly (simulating a plugin or external registration)
      internalBus.registerStream(OtherCommand, (cmd, _ctx, next) => {
        next(cmd.data + "_handled", true);
        return () => {};
      });

      const result = await new Promise<string>((resolve) => {
        bus.execute(new OtherCommand("test")).subscribe(resolve);
      });

      assertEquals(result, "test_handled");
      // Crucial check: should have called internalBus.stream because local handler didn't exist
      assertSpyCalls(streamSpy, 1);
    },
  );
});

Deno.test("ObservableCommandBus - should execute observable handler and emit values", async () => {
  const bus = new ObservableCommandBus({});

  // Register a handler that returns an RxJS Observable
  bus.register(TestCommand, (command) => {
    return of(1, 2, 3).pipe(
      map((val) => val * command.data), // 1*10, 2*10, 3*10
    );
  });

  const result: number[] = [];

  // Execute returns an Observable
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
  const bus = new ObservableCommandBus({});

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
  const bus = new ObservableCommandBus({});
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
  const bus = new ObservableCommandBus({});

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
  const bus = new ObservableCommandBus({});

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

Deno.test("ObservableCommandBus - should support RxJS operators (e.g. takeUntil via signal is implicit)", async () => {
  const bus = new ObservableCommandBus({});

  // A long running command
  bus.register(TestCommand, () => {
    return timer(0, 20).pipe(
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

Deno.test("ObservableCommandBus - mixing with AbortSignal (if supported by underlying bus)", () => {
  // This tests if the adapter correctly wires the AbortSignal from the underlying bus
  // if you were to use the underlying bus directly, but here we test the Observable layer
  // ensuring it cleans up if we unsubscribe locally.

  const bus = new ObservableCommandBus({});
  const subject = new Subject<number>();

  bus.register(TestCommand, () => subject.asObservable());

  let received = 0;
  const sub = bus.execute(new TestCommand(0)).subscribe((v) => received = v);

  subject.next(1);
  assertEquals(received, 1);

  sub.unsubscribe();

  // Should be ignored after unsubscribe
  subject.next(2);
  assertEquals(received, 1);
});
