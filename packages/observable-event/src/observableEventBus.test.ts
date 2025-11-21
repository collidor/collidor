import { assertEquals } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { ObservableEventBus } from "./observableEventBus.ts";

import { take } from "rxjs/operators";
import { Event, EventBus } from "@collidor/event";

// --- Test Events ---
class UserCreated extends Event<string> {}
class OrderPlaced extends Event<{ id: number; total: number }> {}

Deno.test("ObservableEventBus", async (t) => {
  await t.step("should receive events as an observable stream", () => {
    const bus = new ObservableEventBus();
    const result: string[] = [];

    // Subscribe
    const sub = bus.on(UserCreated).subscribe((data) => {
      result.push(data);
    });

    // Emit
    bus.emit(new UserCreated("alice"));
    bus.emit(new UserCreated("bob"));

    assertEquals(result, ["alice", "bob"]);
    sub.unsubscribe();
  });

  await t.step(
    "should correctly unregister from underlying bus on unsubscribe",
    () => {
      const internalBus = new EventBus();
      const bus = new ObservableEventBus(internalBus);

      // Spy on the internal 'off' method to ensure cleanup happens
      const offSpy = spy(internalBus, "off");

      const sub = bus.on(UserCreated).subscribe(() => {});

      // Emit to prove it's working (optional)
      bus.emit(new UserCreated("test"));

      // Unsubscribe via RxJS
      sub.unsubscribe();

      // Assert internal bus cleanup was triggered
      assertSpyCalls(offSpy, 1);
    },
  );

  await t.step("should handle listening to multiple event types", () => {
    const bus = new ObservableEventBus();
    const result: any[] = [];

    bus.on([UserCreated, OrderPlaced]).subscribe((data) => {
      result.push(data);
    });

    bus.emit(new UserCreated("charlie"));
    bus.emit(new OrderPlaced({ id: 1, total: 100 }));

    assertEquals(result, ["charlie", { id: 1, total: 100 }]);
  });

  await t.step("should support RxJS operators", async () => {
    const bus = new ObservableEventBus();
    const result: string[] = [];

    // Example: Take only the first 2 events
    await new Promise<void>((resolve) => {
      bus.on(UserCreated).pipe(take(2)).subscribe({
        next: (data) => result.push(data),
        complete: resolve,
      });

      bus.emit(new UserCreated("1"));
      bus.emit(new UserCreated("2"));
      bus.emit(new UserCreated("3")); // Should be ignored
    });

    assertEquals(result, ["1", "2"]);
  });
});
