/**
 * States which the GOAP actions use to build a graph.
 */
export class State<T = any> {
  public importance: number = 0;
  public effect: string;
  public value: T;

  /**
   * @param importance - the importance of the state being reached.
   * Only necessary if the state is used to define a worldState. Has no effect in Actions being taken.
   * Do NOT set this to Infinity since this causes the goal to be removed from the set by the planner.
   *
   * @param effect - the effect the state has
   * @param value - the value of the effect
   */
  public constructor(importance: number, effect: string, value: T) {
    this.importance = !importance || importance < 0 ? 0 : importance;
    this.effect = effect;
    this.value = value;
  }
}
