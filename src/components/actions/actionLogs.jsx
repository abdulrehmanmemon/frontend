import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Badge from "@/components/daisyui/Badge/Badge";
import Table from "@/components/daisyui/Table/Table";
import TableRow from "@/components/daisyui/Table/TableRow";
import { supabaseCompanies } from "../../helpers/supabaseClient";
import { supabaseSegments } from "../../helpers/supabaseClient";
import Button from "@/components/daisyui/Button/Button";

const ActionLogs = () => {
  const location = useLocation();
  const workflow_id=location.state?.workflowId;
  const [logs, setLogs] = useState(location.state?.logs || []);
  const [startNodes, setStartNodes] = useState(location.state?.startNodes || []);
  const [segment, setSegment] = useState(location.state?.normalizedSegment || "No Segment");
  const [selectedStatus, setSelectedStatus] = useState("Action Logs");
  const [resultsData, setResultsData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); 
  const [workflowStatus, setWorkflowStatus] = useState(null);

  useEffect(() => {
    if (selectedStatus === "Results") {
      fetchResultsData(currentPage);
    }
  }, [selectedStatus, currentPage]);

  const fetchResultsData = async (page) => {
    setLoading(true); 
    try {
      const pageSize = 10;
      const offset = (page - 1) * pageSize;
      const tableName = `segment_${logs[0]?.segment_id}`;

      const { data, error, count } = await supabaseCompanies
        .from(tableName)
        .select("*", { count: "exact" })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      if (data) {
        setResultsData(data);
        setColumns(Object.keys(data[0] || {}));
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (error) {
      console.error("Error fetching results data from Supabase:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      
      if (!workflow_id) {
        throw new Error("No workflow ID found");
      }

      const { error } = await supabaseSegments
        .from('workflows')
        .update({ status: 'ARCHIVED' })
        .eq('workflow_id', workflow_id);

      if (error) throw error;

      setWorkflowStatus('ARCHIVED');
    } catch (error) {
      console.error("Error archiving workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 overflow-hidden bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Action Details Section */}
        <div className="card border border-gray-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-semibold mb-2">
            {startNodes[0]?.action_name || "No Action Name"}
          </h2>
          <p className="text-sm text-gray-500">
            {startNodes[0]?.action_description || "No description available"}
          </p>
          
          {/* Status and Archive Button */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <Badge 
                size="md"
                className={`text-white ${workflowStatus === 'ARCHIVED' ? 'badge-error' : 'badge-success'} p-2`}
              > 
                {workflowStatus ? workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1).toLowerCase() : 'Active'}
              </Badge>
            </div>
            {workflowStatus !== 'ARCHIVED' && (
              <Button 
                size="sm" 
                color="secondary" 
                variant="outline" 
                aria-label="Archive workflow"
                onClick={handleArchive}
              >
                Archive
              </Button>
            )}
          </div>

          <div className="mt-6">
            <div className="flex flex-col justify-center gap-y-3 mb-4">
              <span className="block font-semibold text-gray-700 text-md">
                Associated Segments:
              </span>
              <Badge className="text-sm block badge-md">
                {segment}
              </Badge>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-md text-gray-700">
                Action Frequency:
              </span>
            </div>
            <div className="flex flex-col mb-4">
              <div className="flex items-center mb-4 gap-x-3">
                <div>
                  <Badge className="text-gray-700 text-sm badge-md">
                    Execute {startNodes[0]?.execute_every} 
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 w-20 text-sm">
                    Start:
                  </span>
                  <span className="text-gray-700 text-sm">
                    {startNodes[0]?.start_date || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 w-20 text-sm">
                    End:
                  </span>
                  <span className="text-gray-700 text-sm">
                    {startNodes[0]?.end_date || "N/A" }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Log Section */}
        <div className="card border border-gray-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Action Logs</h2>
          <div className="tabs tabs-boxed w-fit flex mb-4">
            {["Action Logs", "Recent Results"].map((status) => (
              <a
                key={status}
                href="#"
                className={`tab ${selectedStatus === status ? "tab-active" : ""}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </a>
            ))}
          </div>

          {selectedStatus === "Action Logs" && (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr className="">
                    <th>Date</th>
                    <th>Status</th>
                    <th>Segment</th>
                    <th>Records Processed</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-600 text-sm">
                        No logs available.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <TableRow key={index}>
                        <td className="font-normal text-sm">
                          {log.lastexecuted
                            ? new Date(log.lastexecuted).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="text-xs">
                          <Badge className="text-sm">
                            {log.status ? "Success" : "Failure"}
                          </Badge>
                        </td>
                        <td className="text-sm">{log.segment || "No Segment"}</td>
                        <td className="text-sm">{log.size || 0}</td>
                        <td className="text-sm">{log.errors || 0}</td>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {selectedStatus === "Results" && (
            <div className="overflow-x-auto">
              {loading ? ( 
                <div className="text-center py-6 text-gray-600">Loading...</div>
              ) : (
                <>
                  <Table className="table w-full">
                    <thead>
                      <tr>
                        {columns.map((col, index) => (
                          <th key={index} className="font-bold text-center">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className="text-center text-gray-600">
                            No data available.
                          </td>
                        </tr>
                      ) : (
                        resultsData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                              <td key={colIndex} className="border text-sm">
                                {row[col] || ""}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>

                  <div className="join mt-4 flex justify-center">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        className={`join-item btn btn-sm mt-2 mb-6 ${currentPage === index + 1 ? "btn-active" : ""}`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionLogs;
