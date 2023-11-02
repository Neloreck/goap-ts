/**
 * Action that is thrown from planner when action cannot be performed.
 */
export class NotPerformableActionError extends Error {
  public override name: string = "NotPerformableActionError";
  public override message: string = "The action cannot be executed.";
}
