import React, { createContext, useContext, PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { compose, Provider } from "./index";

describe("compose", () => {
  it("renders a single component", () => {
    function Content() {
      return <div data-testid="content">Hello</div>;
    }

    const Composed = compose([Content]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("Hello");
  });

  it("wraps content with a single provider", () => {
    const ThemeContext = createContext("light");

    function ThemeProvider({ children }: PropsWithChildren) {
      return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
    }

    function Content() {
      const theme = useContext(ThemeContext);
      return <div data-testid="content">{theme}</div>;
    }

    const Composed = compose([ThemeProvider, Content]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("dark");
  });

  it("wraps content with multiple providers in correct order", () => {
    const values: string[] = [];

    function Provider1({ children }: PropsWithChildren) {
      values.push("provider1");
      return <div data-testid="p1">{children}</div>;
    }

    function Provider2({ children }: PropsWithChildren) {
      values.push("provider2");
      return <div data-testid="p2">{children}</div>;
    }

    function Content() {
      values.push("content");
      return <div data-testid="content">Content</div>;
    }

    const Composed = compose([Provider1, Provider2, Content]);
    render(<Composed />);

    expect(values).toEqual(["provider1", "provider2", "content"]);
    expect(screen.getByTestId("p1")).toContainElement(screen.getByTestId("p2"));
    expect(screen.getByTestId("p2")).toContainElement(screen.getByTestId("content"));
  });

  it("passes props to the innermost component", () => {
    interface ContentProps {
      message: string;
    }

    function Provider1({ children }: PropsWithChildren) {
      return <div>{children}</div>;
    }

    function Content({ message }: ContentProps) {
      return <div data-testid="content">{message}</div>;
    }

    const Composed = compose<ContentProps>([Provider1, Content]);
    render(<Composed message="Hello World" />);

    expect(screen.getByTestId("content")).toHaveTextContent("Hello World");
  });

  it("supports tuple syntax for provider props", () => {
    const ThemeContext = createContext("light");

    function ThemeProvider({ children, theme }: PropsWithChildren<{ theme: string }>) {
      return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
    }

    function Content() {
      const theme = useContext(ThemeContext);
      return <div data-testid="content">{theme}</div>;
    }

    const Composed = compose([[ThemeProvider, { theme: "dark" }], Content]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("dark");
  });

  it("supports multiple providers with tuple syntax", () => {
    const ThemeContext = createContext("light");
    const LocaleContext = createContext("en");

    function ThemeProvider({ children, theme }: PropsWithChildren<{ theme: string }>) {
      return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
    }

    function LocaleProvider({ children, locale }: PropsWithChildren<{ locale: string }>) {
      return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
    }

    function Content() {
      const theme = useContext(ThemeContext);
      const locale = useContext(LocaleContext);
      return <div data-testid="content">{`${theme}-${locale}`}</div>;
    }

    const Composed = compose([
      [ThemeProvider, { theme: "dark" }],
      [LocaleProvider, { locale: "pl" }],
      Content,
    ]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("dark-pl");
  });

  it("supports mixing tuple and non-tuple providers", () => {
    const ThemeContext = createContext("light");
    const AuthContext = createContext(false);

    function ThemeProvider({ children, theme }: PropsWithChildren<{ theme: string }>) {
      return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
    }

    function AuthProvider({ children }: PropsWithChildren) {
      return <AuthContext.Provider value={true}>{children}</AuthContext.Provider>;
    }

    function Content() {
      const theme = useContext(ThemeContext);
      const isAuth = useContext(AuthContext);
      return <div data-testid="content">{`${theme}-${isAuth}`}</div>;
    }

    const Composed = compose([[ThemeProvider, { theme: "dark" }], AuthProvider, Content]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("dark-true");
  });

  it("passes children through when provided", () => {
    function Wrapper({ children }: PropsWithChildren) {
      return <div data-testid="wrapper">{children}</div>;
    }

    function Content({ children }: PropsWithChildren) {
      return <div data-testid="content">{children}</div>;
    }

    const Composed = compose([Wrapper, Content]);
    render(<Composed>Child content</Composed>);

    expect(screen.getByTestId("content")).toHaveTextContent("Child content");
  });

  it("works with React.Context.Provider directly", () => {
    const MyContext = createContext("default");

    function Content() {
      const value = useContext(MyContext);
      return <div data-testid="content">{value}</div>;
    }

    const Composed = compose([[MyContext.Provider, { value: "custom" }], Content]);
    render(<Composed />);

    expect(screen.getByTestId("content")).toHaveTextContent("custom");
  });
});
