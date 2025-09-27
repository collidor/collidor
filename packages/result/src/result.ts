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
export type Unwrap<T> = T extends Ok<infer U> ? U : never;

export const Result = {
  /**
   * Creates an Ok result with the given value.
   * @param value
   * @returns
   */
  ok: <T = any, E = ErrorLike>(value?: T): Ok<T, E> => ({
    success: true,
    value: value as any,
  }),
  /**
   * Creates an Err result with the given error.
   * @param error
   * @returns
   */
  err: <E = ErrorLike, T = any>(error: E): Err<E, T> => ({
    success: false,
    error,
  }),
  /**
   * Represents a none result, with success false and error null.
   * @returns
   */
  none: <T>(): Result<T> => ({ success: false, error: null }),
  /**
   * Checks if a value is a Result, based on the presence of 'success' property and either 'value' or 'error' properties.
   * @param thing
   * @returns
   */
  isResult: (thing: any): thing is Result => {
    return (
      thing &&
      typeof thing === "object" &&
      "success" in thing &&
      typeof thing.success === "boolean" &&
      ("value" in thing || "error" in thing)
    );
  },
  /**
   * @param result The value or error to convert to a Result
   * @returns a Result wrapping the value or error
   */
  from: <T, E = ErrorLike>(result: T | E): Result<T, E> => {
    if (result instanceof Error) {
      return Result.err<E, T>(result as E);
    }
    return Result.ok<T, E>(result as T);
  },
  /**
   * Converts a promise to a Result, capturing any rejects into Result.err.
   *
   * @param promise The promise to convert to a Result
   */
  fromPromise: <T, E = ErrorLike>(
    promise: Promise<T>,
  ): Promise<Result<T, E>> => {
    return promise
      .then((value) => Result.ok<T, E>(value))
      .catch((error) => Result.err<E, T>(error));
  },
  /**
   * Helper to unwrap a Result, returning the value or throwing if it's an error.
   *
   * @param result The result to unwrap
   * @returns the value if the result is ok
   * @throws if the result is an error
   */
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (!result) {
      throw new Error("Result is undefined");
    }
    if ((typeof result !== "object") || !("success" in (result as any))) {
      return result as T;
    }
    if (result.success) {
      return result.value;
    }
    if (result.error instanceof Error) {
      throw result.error;
    }
    if (typeof result.error === "string") {
      throw new Error(result.error);
    }
    throw new Error("An error occurred");
  },
};
