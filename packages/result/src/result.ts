export type ErrorLike = { message: string } & ErrorOptions;

export type Ok<T = any, E = ErrorLike> = {
  success: true;
  value: T;
  error?: E;
};

export type Err<E = ErrorLike, T = any> = {
  success: false;
  error: E;
  value?: T;
};

export type None = Err<null, null>;
export type Result<T = any, E = ErrorLike | null> = Ok<T, E> | Err<E, T>;

/**
 * Infers the value type from a Result or a Promise of a Result.
 */
export type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U>
  : T extends Ok<infer U> ? U
  : T extends Err<any, infer U> ? U
  : T;

const isErrorLike = (e: any): e is ErrorLike => {
  return (
    e !== null &&
    typeof e === "object" &&
    typeof e.message === "string"
  );
};

export class ResultUtils {
  /**
   * Creates an Ok result.
   */
  static ok<T = any, E = ErrorLike>(value?: T): Ok<T, E> {
    if (ResultUtils.isResult(value)) {
      return value as Ok<T, E>;
    }
    return {
      success: true,
      value: value as any,
    };
  }

  /**
   * Creates an Err result.
   */
  static err<E = ErrorLike, T = any>(error: E): Err<E, T> {
    if (ResultUtils.isResult(error)) {
      return error as Err<E, T>;
    }
    return {
      success: false,
      error,
    };
  }

  /**
   * Represents a failed result with a null error.
   */
  static none<T>(): Result<T> {
    return { success: false, error: null };
  }

  /**
   * Checks if a value is a Result object.
   */
  static isResult(thing: any): thing is Result {
    return (
      !!thing &&
      typeof thing === "object" &&
      "success" in thing &&
      (Object.hasOwn(thing, "value") || Object.hasOwn(thing, "error"))
    );
  }

  /**
   * Converts a value or Error to a Result.
   */
  static from<T, E = ErrorLike>(result: T | E): Result<T, E> {
    if (isErrorLike(result)) {
      return ResultUtils.err<E, T>(result as E);
    }
    return ResultUtils.ok<T, E>(result as T);
  }

  /**
   * Wraps a promise, catching rejections into a Result.
   */
  static async fromPromise<T, E = ErrorLike>(
    promise: Promise<T>,
  ): Promise<Result<T, E>> {
    try {
      const val = await promise;
      return ResultUtils.ok<T, E>(val);
    } catch (error) {
      return ResultUtils.err<E, T>(error as E);
    }
  }

  /**
   * Returns the value if successful, otherwise throws the error.
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (!ResultUtils.isResult(result)) return result as T;
    if (result.success) return result.value;

    const err = result.error;
    if (isErrorLike(err)) {
      const localError = new Error(err.message);
      Object.assign(localError, err);
      if ((err as any).stack) {
        localError.stack = `${localError.stack}\nFrom Remote: ${
          (err as any).stack
        }`;
      }
      throw localError;
    }
    throw new Error(
      typeof err === "string" ? err : "An unspecified error occurred",
    );
  }

  /**
   * Transforms the value if successful.
   */
  static map<T, E, U>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
    return result.success
      ? ResultUtils.ok(fn(result.value))
      : (result as unknown as Result<U, E>);
  }

  /**
   * Chains another Result-returning function.
   */
  static chain<T, E, U>(
    result: Result<T, E>,
    fn: (val: T) => Result<U, E>,
  ): Result<U, E> {
    return result.success
      ? fn(result.value)
      : (result as unknown as Result<U, E>);
  }

  /**
   * Returns the value or a default value if failed.
   */
  static getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.success ? result.value : defaultValue;
  }

  /**
   * Wraps a function that might throw.
   */
  static try<T, E = ErrorLike>(fn: () => T): Result<T, E> {
    try {
      return ResultUtils.ok(fn());
    } catch (e) {
      return ResultUtils.err(e as E);
    }
  }

  /**
   * Functional composition for Results.
   */
  static pipe<T, E, A>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
  ): Result<Unwrap<A>, E>;
  static pipe<T, E, A, B>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
  ): Result<Unwrap<B>, E>;
  static pipe<T, E, A, B, C>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
  ): Result<Unwrap<C>, E>;
  static pipe<T, E, A, B, C, D>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
  ): Result<Unwrap<D>, E>;
  static pipe<T, E, A, B, C, D, F>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
  ): Result<Unwrap<F>, E>;
  static pipe<T, E, A, B, C, D, F, G>(
    res: Result<T, E> | Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
    op6: (val: Unwrap<F>) => G,
  ): Result<Unwrap<G>, E>;
  static pipe<T, E, A, B, C, D, F, G, H>(
    res: Result<T, E>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
    op6: (val: Unwrap<F>) => G,
    op7: (val: Unwrap<G>) => H,
  ): Result<Unwrap<H>, E>;

  static pipe(
    initial: any,
    ...fns: Array<(v: any) => any>
  ): any {
    let res = initial;
    for (const fn of fns) {
      if (!res.success) break;
      const next = fn(res.value);
      res = next;
      if (!ResultUtils.isResult(res)) res = ResultUtils.ok(res);
    }
    return res;
  }

  /**
   * Async functional composition for Results.
   */
  static pipeAsync<T, E, A>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
  ): Promise<Result<Unwrap<A>, E>>;
  static pipeAsync<T, E, A, B>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
  ): Promise<Result<Unwrap<B>, E>>;
  static pipeAsync<T, E, A, B, C>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
  ): Promise<Result<Unwrap<C>, E>>;
  static pipeAsync<T, E, A, B, C, D>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
  ): Promise<Result<Unwrap<D>, E>>;
  static pipeAsync<T, E, A, B, C, D, F>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
  ): Promise<Result<Unwrap<F>, E>>;
  static pipeAsync<T, E, A, B, C, D, F, G>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
    op6: (val: Unwrap<F>) => G,
  ): Promise<Result<Unwrap<G>, E>>;
  static pipeAsync<T, E, A, B, C, D, F, G, H>(
    res: Result<T, E> | Promise<Result<T, E>>,
    op1: (val: T) => A,
    op2: (val: Unwrap<A>) => B,
    op3: (val: Unwrap<B>) => C,
    op4: (val: Unwrap<C>) => D,
    op5: (val: Unwrap<D>) => F,
    op6: (val: Unwrap<F>) => G,
    op7: (val: Unwrap<G>) => H,
  ): Promise<Result<Unwrap<H>, E>>;

  static async pipeAsync(
    initial: any,
    ...fns: Array<(v: any) => any>
  ): Promise<any> {
    let res = await initial;
    for (const fn of fns) {
      if (!res.success) break;
      const next = fn(res.value);
      res = next instanceof Promise ? await next : next;
      if (!ResultUtils.isResult(res)) res = ResultUtils.ok(res);
    }
    return res;
  }

  /**
   * Combines multiple results into a single result.
   */
  static combine<T extends Result<any, any>[]>(results: T): Result<any[], any> {
    const values = [];
    for (const res of results) {
      if (!res.success) return res;
      values.push(res.value);
    }
    return ResultUtils.ok(values);
  }
}

/**
 * Result pattern utilities.
 */
export const Result = ResultUtils;
