import { IErrorHandler } from "@/error/IErrorHandler";

export class SilentErrorHandler implements IErrorHandler {
  public onError(error: Error): void {
    // Nothing by default.
  }
}
