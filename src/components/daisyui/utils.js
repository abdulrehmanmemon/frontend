import { Children, Fragment, cloneElement, isValidElement } from "react";

import { cn } from "@/helpers";

export const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Returns true if an element is a react fragment
export const isReactFragment = (node) => {
  if (!node) return false;

  if (node?.type) {
    return node?.type === Fragment;
  }

  return node === Fragment;
};

// If an invalid element or fragment is passed in as the node, wrap it with the wrapper and add props
// If a valid element is passed, add the props
export const wrapWithElementIfInvalid = ({ node, wrapper, props = {} }) => {
  if (!node) {
    return cloneElement(wrapper, props);
  } else if (!isValidElement(node)) {
    return cloneElement(wrapper, props, node);
  } else if (isReactFragment(node)) {
    return cloneElement(
      wrapper,
      { ...props, className: cn(node.props?.className, props?.className) },
      node.props.children
    );
  } else {
    return cloneElement(node, {
      ...props,
      className: cn(node.props?.className, props?.className),
    });
  }
};

// Returns true if there is a single, string child element
export const isSingleStringChild = (children) => {
  return (
    children &&
    Children.count(children) === 1 &&
    isValidElement(children) &&
    typeof children.props.children === "string"
  );
};
