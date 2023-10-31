import { IErrorHandler } from "@/error/IErrorHandler";

export class ErrorHandler implements IErrorHandler {
  public onError(error: Error): void {
    // Nothing by default.
  }
}
