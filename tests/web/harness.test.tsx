import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

function Greeting({ name }: { name: string }) {
  return <p>Hello {name}</p>;
}

describe("web test harness", () => {
  test("renders a component into jsdom", () => {
    render(<Greeting name="Ada" />);

    expect(screen.getByText("Hello Ada")).toBeInTheDocument();
  });
});
