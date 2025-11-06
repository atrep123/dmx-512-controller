import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import React, { useState } from "react";
import ScenesView from "@/components/ScenesView";
import type { Fixture, Scene, Universe } from "@/lib/types";
import { registerServerClient, notifyAck } from "@/lib/transport";

describe("ScenesView optimistic revert on NACK", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame"],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    registerServerClient(null as any);
  });

  function Harness() {
    const universes: Universe[] = [{ id: "u0", name: "U0", number: 0 }];
    const [fixtures, setFixtures] = useState<Fixture[]>([
      {
        id: "fx1",
        name: "Fx",
        dmxAddress: 1,
        channelCount: 1,
        universeId: "u0",
        channels: [{ id: "ch1", number: 1, name: "Ch1", value: 0 }],
        fixtureType: "generic",
      },
    ]);
    const [scenes, setScenes] = useState<Scene[]>([
      {
        id: "s1",
        name: "S1",
        channelValues: { ch1: 200 },
        timestamp: Date.now(),
      },
    ]);
    const [activeScene, setActiveScene] = useState<string | null>(null);

    return (
      <div>
        <div data-testid="val">{fixtures[0].channels[0].value}</div>
        <ScenesView
          scenes={scenes}
          setScenes={setScenes}
          fixtures={fixtures}
          setFixtures={setFixtures}
          universes={universes}
          activeScene={activeScene}
          setActiveScene={setActiveScene}
        />
      </div>
    );
  }

  test("optimistic apply then revert on NACK", () => {
    // Mock client: whenever a command is sent, immediately NACK it
    registerServerClient({
      sendCommand: (cmd: any) => {
        // Schedule NACK to be processed after the optimistic update
        setTimeout(() => {
          notifyAck({ ack: cmd.id, accepted: false } as any);
        }, 0);
      },
      setRgb: () => {},
      close: () => {},
    } as any);

    render(<Harness />);

    // Initial value should be 0
    expect(screen.getByTestId("val")).toHaveTextContent("0");

    // Click "Obnovit" on the single scene
    const btn = screen.getByText("Obnovit");

    act(() => {
      fireEvent.click(btn);
    });

    // Optimistic: value becomes 200
    expect(screen.getByTestId("val")).toHaveTextContent("200");

    // Process the NACK
    act(() => {
      vi.runAllTimers();
    });

    // Reverted back to 0 after NACK
    expect(screen.getByTestId("val")).toHaveTextContent("0");
  });
});
