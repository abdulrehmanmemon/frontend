import React from 'react'
import ChartDisplay from '../charts/ChartDisplay'

const Charts = ({query,pivotConfig,chartType}) => {
  return (
    <div className='w-full'>
      <ChartDisplay d_query={query} d_pivotConfig={pivotConfig} d_chartType={chartType}  />
    </div>
  )
}

export default Charts
