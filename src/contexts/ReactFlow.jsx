import { WorkflowTemplate } from "../components/flows/WorkflowTemplate";
import {ReactFlowProvider } from 'reactflow';

import React from 'react'

const Flow = () => {
  return (
    <ReactFlowProvider>
 <WorkflowTemplate/>
    </ReactFlowProvider>
  )
}

export default Flow
