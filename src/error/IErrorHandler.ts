/**
 * Handler object for actions execution.
 */
export interface IErrorHandler {
  /**
   * Method gets called on library exception to provide information about place / conditions where it happened.
   *
   * @param error - exception thrown from internals
   * @param comment - exception comment from the library
   */
  onError(error: Error, comment?: string): void;
}
