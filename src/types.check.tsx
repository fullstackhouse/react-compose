import React, { PropsWithChildren } from "react";
import { compose, Provider } from "./index";

/**
 * Type-level tests for compose function.
 * These tests verify TypeScript catches type errors at compile time.
 * If this file compiles without errors, the types are working correctly.
 */

function SimpleProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

function PropsProvider({ children, value }: PropsWithChildren<{ value: string }>) {
  return <>{children}</>;
}

function Content({ message }: { message: string }) {
  return <div>{message}</div>;
}

function NoPropsContent() {
  return <div>No props</div>;
}

// ============================================================================
// VALID USAGES - These should compile without errors
// ============================================================================

// Single component
const _single = compose([NoPropsContent]);

// Provider + content
const _providerContent = compose([SimpleProvider, Content]);

// Multiple providers + content
const _multiProvider = compose([SimpleProvider, SimpleProvider, Content]);

// Tuple syntax for provider props
const _tupleProvider = compose([[PropsProvider, { value: "test" }], Content]);

// Mixed tuple and non-tuple
const _mixed = compose([SimpleProvider, [PropsProvider, { value: "test" }], Content]);

// Using the composed components with correct props
const ComposedWithProps = compose<{ message: string }>([SimpleProvider, Content]);
function ValidUsage() {
  return <ComposedWithProps message="hello" />;
}

// Composed component without required props
const ComposedNoProps = compose([SimpleProvider, NoPropsContent]);
function ValidNoPropsUsage() {
  return <ComposedNoProps />;
}

// ============================================================================
// Provider type tests
// ============================================================================

const _provider1: Provider = SimpleProvider;
const _provider2: Provider<{ value: string }> = PropsProvider;
const _provider3: Provider<{ value: string }> = [PropsProvider, { value: "test" }] as const;

export { ValidUsage, ValidNoPropsUsage };
