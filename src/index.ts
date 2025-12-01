import React, { ComponentType, PropsWithChildren } from "react";

/**
 * A component provider can be either:
 * - A component type that accepts children
 * - A tuple of [Component, props] to pass specific props to the component
 */
export type Provider<TProps extends object = object> =
  | ComponentType<PropsWithChildren<TProps>>
  | readonly [ComponentType<PropsWithChildren<TProps>>, TProps];

/**
 * Composes an array of React components/providers into a single component.
 *
 * The components are nested in order, with the first component being the outermost wrapper
 * and the last component being the innermost (the actual content).
 *
 * @example
 * ```tsx
 * // Basic usage - compose providers with a content component
 * const MyScreen = compose([
 *   ThemeProvider,
 *   AuthProvider,
 *   MyScreenContent,
 * ]);
 *
 * // With props - use tuple syntax [Component, props]
 * const MyScreen = compose([
 *   [ThemeProvider, { theme: 'dark' }],
 *   [AuthProvider, { timeout: 5000 }],
 *   MyScreenContent,
 * ]);
 * ```
 *
 * @param providers - Array of components or [component, props] tuples
 * @returns A composed component that renders all providers nested
 */
export function compose<TProps extends object = object>(
  providers: readonly Provider<any>[],
): ComponentType<TProps> {
  function ComposedComponent(props: TProps) {
    const initialChildren =
      "children" in props ? React.createElement(React.Fragment, null, props.children as React.ReactNode) : null;

    return providers.reduceRight<React.ReactNode>((children, provider) => {
      const [Component, providerProps] = Array.isArray(provider)
        ? (provider as [ComponentType<PropsWithChildren<object>>, object])
        : [provider as ComponentType<PropsWithChildren<object>>, {}];

      return React.createElement(Component, { ...props, ...providerProps }, children);
    }, initialChildren);
  }

  return ComposedComponent;
}
