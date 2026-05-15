[![Codecov](https://codecov.io/gh/collidor/collidor/branch/main/graph/badge.svg?flag=result)](https://codecov.io/gh/collidor/collidor)
[![npm version](https://img.shields.io/npm/v/@collidor/result)](https://www.npmjs.com/package/@collidor/result)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Result

A lightweight, type-safe `Result` pattern implementation for robust error handling in TypeScript.

- 🚀 Zero dependencies
- 🛡️ Type-safe error handling
- 🔄 Functional piping (sync/async)
- 🛠️ Rich utility set (map, chain, combine, etc.)
- 🌐 Boundary-safe check for cross-context results

## Installation

```bash
npm install @collidor/result
```

## Basic Usage

```typescript
import { Result } from "@collidor/result";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.err("Division by zero");
  }
  return Result.ok(a / b);
}

const res = divide(10, 2);
if (res.success) {
  console.log(res.value); // 5
} else {
  console.error(res.error); // "Division by zero"
}
```

## Features

### Creating Results
- `Result.ok(value)`: Creates a successful result.
- `Result.err(error)`: Creates a failure result.
- `Result.none()`: Shortcut for a failed result with `null` error.
- `Result.try(() => ...)`: Wraps a function that might throw.
- `Result.from(value | Error)`: Converts a value or Error object to a Result.
- `Result.fromPromise(promise)`: Wraps a promise, catching rejections into a Result.

### Working with Results
- `Result.isResult(thing)`: Boundary-safe check if a value is a Result object.
- `Result.unwrap(result)`: Returns the value or throws a re-hydrated Error.
- `Result.getOrElse(result, defaultValue)`: Returns value or a default.
- `Result.map(result, fn)`: Transforms the value if successful.
- `Result.chain(result, fn)`: Chains another Result-returning function.
- `Result.combine(results[])`: Combines multiple results into one (all-or-nothing).

### Functional Piping
Piping allows you to chain operations cleanly:

```typescript
const result = Result.pipe(
  Result.ok(10),
  (n) => n * 2,
  (n) => Result.ok(n + 5),
  (n) => n.toString()
);
// Result.ok("25")
```

For asynchronous operations:
```typescript
const result = await Result.pipeAsync(
  Result.ok(10),
  async (n) => n * 2,
  (n) => Promise.resolve(Result.ok(n + 5))
);
```

## API Documentation

### Types
- `Result<T, E>`: The main type, union of `Ok<T, E>` and `Err<E, T>`.
- `Unwrap<T>`: Helper type to infer the value type from a `Result` or `Promise<Result>`.

### Result Static Methods

| Method | Description |
| --- | --- |
| `ok(value?)` | Creates an Ok result. |
| `err(error)` | Creates an Err result. |
| `none()` | Creates a failed result with `null` error. |
| `isResult(thing)` | Checks if value is a Result object. |
| `from(val)` | Converts value or Error to Result. |
| `fromPromise(p)` | Wraps a promise into a Result. |
| `unwrap(res)` | Gets value or throws re-hydrated Error. |
| `map(res, fn)` | Transforms value if success. |
| `chain(res, fn)` | FlatMap for Results. |
| `getOrElse(res, def)` | Gets value or returns default. |
| `try(fn)` | Executes fn and catches any error into Result. |
| `pipe(res, ...ops)` | Functional composition for Results. |
| `pipeAsync(res, ...ops)` | Async functional composition. |
| `combine(results)` | Turns `Result[]` into `Result<any[]>`. |

# Contribution

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create new Pull Request

# License

MIT © Alykam Burdzaki
