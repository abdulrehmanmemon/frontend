import cubejs from '@cubejs-client/core';

const cubejsApi = cubejs(import.meta.env.VITE_CUBE_API_TOKEN, {
  apiUrl:import.meta.env.VITE_CUBE_API_URL,
});

export default cubejsApi;
