import { Navigate, Route, Routes } from "react-router-dom";
import { Leftbar } from "./Bars/LeftBar";
import { Topbar } from "./Bars/TopBar";
import Home from './screens/Home';
import Segments from './segments/Segment';
import Actions from './actions/actions';
import SegmentBuilder from './segments/SegmentBuilder';
import SegmentDetail from './segments/SegmentDetails';
import CreateAction from './actions/CreateAction';
import FlowDetails from "./actions/FlowDetails";
import ActionLogs from "./actions/actionLogs";
import Chatbot from "./screens/Chatbot";
import Flow from "../contexts/ReactFlow";
import Listing from "./companies/Listing";
import CompanyDetail from "./companies/CompanyDetail";
import Confirmation from "./companies/Confirmation";
import StartAnalysis from "./companies/StartAnalysis";
import CaptureFXPaymentsWrapper from "./flows/CaptureFXPaymentsWrapper";
import FXHedging from "./flows/FXHedging";
import FXExposureWrapper from "./flows/FXExposureWrapper";
import AutoSegment from '@/pages/auto-segment';

export default function Layout() {
  return (
    <section className="flex h-screen overflow-y-hidden">
      <aside
        style={{
          borderRight: '1px solid #e5e7eb', 
          backgroundColor: '#f9fafb', 
        }}
      >
        <Leftbar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Topbar */}
        <header>
          <Topbar />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Routes>
            <Route path="/" element={<Navigate to="/actions" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/segment-builder" element={<SegmentBuilder />} />
            <Route path="/segments/:id" element={<SegmentDetail />} />
            <Route path="/create-action" element={<CreateAction />} />
            <Route path="/actionLogs" element={<ActionLogs />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/workflow-template" element={<Flow />} />
            <Route path="/companies" element={<Listing />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/start-analysis" element={<StartAnalysis />} />
            <Route path="/flow/170" element={<CaptureFXPaymentsWrapper />} />
            <Route path="/flow/169" element={<FXHedging/>}/>
            <Route path="/flow/209" element={<FXExposureWrapper/>}/>
            <Route path="/auto-segment" element={<AutoSegment />} />
          </Routes>
        </main>
      </div>
    </section>
  );
}
