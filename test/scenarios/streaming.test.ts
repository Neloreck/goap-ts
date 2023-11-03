import { describe, expect, it } from "@jest/globals";

import { GenericAction, TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { GenericPlanner } from "@/planner";
import { Property } from "@/property/Property";

describe("shooting scenario", () => {
  const prepareGuests: AbstractAction = new GenericAction("prepare_guests")
    .addPrecondition(new Property("has_connected", true))
    .addPrecondition(new Property("has_camera", true))
    .addEffect(new Property("has_guests", true));

  const prepareScenes: AbstractAction = new GenericAction("prepare_scenes")
    .addPrecondition(new Property("has_connected", true))
    .addEffect(new Property("has_scenes", true));

  const prepareCamera: AbstractAction = new GenericAction("prepare_camera")
    .addPrecondition(new Property("has_connected", true))
    .addEffect(new Property("has_camera", true));

  const prepareConnection: AbstractAction = new GenericAction("prepare_connection")
    .addPrecondition(new Property("has_connected", false))
    .addEffect(new Property("has_connected", true));

  const startStream: AbstractAction = new GenericAction("start_stream")
    .addPrecondition(new Property("has_camera", true))
    .addPrecondition(new Property("has_guests", true))
    .addPrecondition(new Property("has_guests", true))
    .addPrecondition(new Property("has_scenes", true))
    .addEffect(new Property("stream_started", true));

  const showStreamContent: AbstractAction = new GenericAction("show_stream_content")
    .addPrecondition(new Property("stream_started", true))
    .addEffect(new Property("content_shown", true));

  const finishStream: AbstractAction = new GenericAction("finish_stream")
    .addPrecondition(new Property("content_shown", true))
    .addEffect(new Property("stream_ended", true));

  it("should correctly plan order of actions", () => {
    const unit: TestUnit = new TestUnit();

    unit.addWorldState(new Property("has_connected", false));
    unit.addGoalState(new Property("stream_ended", true));

    unit
      .addAction(prepareConnection)
      .addAction(prepareCamera)
      .addAction(prepareGuests)
      .addAction(prepareScenes)
      .addAction(startStream)
      .addAction(showStreamContent)
      .addAction(finishStream);

    const planner: GenericPlanner = new GenericPlanner();

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual([
      "prepare_connection",
      "prepare_scenes",
      "prepare_camera",
      "prepare_guests",
      "start_stream",
      "show_stream_content",
      "finish_stream",
    ]);

    unit.addWorldState(new Property("stream_started", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["show_stream_content", "finish_stream"]);
  });
});
