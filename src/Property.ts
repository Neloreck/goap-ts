/**
 * Properties which the GOAP planner use to build a graph.
 */
export class Property<T = any> {
  public importance: number = 0;
  public effect: string;
  public value: T;

  /**
   * @param effect - the effect the state has
   * @param value - the value of the effect
   * @param importance - the importance of the state being reached. Only necessary if the state is used to define
   *   a worldState. Has no effect in Actions being taken. Do NOT set this to Infinity since this causes the goal to be
   *   removed from the set by the planner
   */
  public constructor(effect: string, value: T, importance?: number) {
    this.effect = effect;
    this.value = value;
    this.importance = !importance || importance < 0 ? 0 : importance;
  }
}
