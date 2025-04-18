import React from 'react';
import { useCubeQuery } from '@cubejs-client/react';

/**
 * QueryRenderer Component
 *
 * @param {Object} props - Component props
 * @param {Object} [props.query] - Cube.js query object
 * @param {Function} [props.children] - Render prop function with resultSet
 * @param {boolean} [props.subscribe] - Whether to subscribe to query updates
 * @returns {JSX.Element | null}
 */
const QueryRenderer = ({ query, children, subscribe }) => {
  const { resultSet, isLoading, error } = useCubeQuery(query ?? {}, { subscribe, skip: !query });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  if (!resultSet) {
    return <div>Empty result set</div>;
  }

  return children?.({ resultSet }) || null;
};

export default QueryRenderer;
