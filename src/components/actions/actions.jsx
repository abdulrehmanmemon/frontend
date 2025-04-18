import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseSegments } from "../../helpers/supabaseClient.js";

import Button from "@/components/daisyui/Button/Button";
import Input from "@/components/daisyui/Input/Input";
import Badge from "@/components/daisyui/Badge/Badge";
import Alert from "@/components/daisyui/Alert/Alert";
import Table from "@/components/daisyui/Table/Table";
import TableRow from "@/components/daisyui/Table/TableRow";

export default function Actions() {
  const [actions, setActions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch Workflow Actions
  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const { data: actionsData, error: actionsError } = await supabaseSegments.rpc(
        "get_workflow_actions"
      );
      if (actionsError) throw actionsError;

      const formattedActions = actionsData.map((item) => ({
        id: item.id,
        name: item.name,
        segment: item.segment || "No Segment",
        actionType: item.actiontype || "No Template",
        size: item.size || 0,
        lastExecuted: item.lastexecuted || new Date().toISOString(),
        status: item.status || "ACTIVE",
      }));

      setActions(formattedActions);
    } catch (error) {
      console.error("Error fetching actions:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // Filter actions
  const filteredActions = actions.filter((action) => {
    const matchesStatus =
      selectedStatus === "All" ||
      (action.status && action.status.toLowerCase() === selectedStatus.toLowerCase());
    const matchesSearch =
      searchQuery === "" || action.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  const handleNavigateToActionLogs = async (workflowId, actionName,actionSegment) => {
    try {
      const normalizedSegment = actionSegment.trim();
      const { data: logsData, error: logsError } = await supabaseSegments
        .from("actions_executions")
        .select("*")
        .eq("workflow_id", workflowId); // Updated to use workflowId
      if (logsError) throw logsError;

      const { data: startNodeData, error: startNodeError } = await supabaseSegments
        .from("start_node_settings")
        .select("*")
        .eq("action_name", actionName);
      if (startNodeError) throw startNodeError;

      navigate("/actionLogs", {
        state: { logs: logsData, startNodes: startNodeData, normalizedSegment, workflowId},
        
      });
      
    } catch (error) {
      console.error("Error navigating to Action Logs:", error.message);
    }
  };
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Actions</h1>

        {/* Tabs for Filtering */}
        <div className="tabs tabs-boxed w-fit flex mb-4">
          {[
            "Active",
            "Draft",
            "Archived",
            "All"
          ].map((status) => (
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

        {/* Search and Create Action */}
        <div className="flex justify-between items-center mb-4 py-4">
          <Input
            type="text"
            placeholder="Search for an action"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full max-w-xs input-md"
          />
          <Button onClick={() => navigate("/create-action")} color="primary" variant="solid" size="md">
            Create action
          </Button>
        </div>

        {/* Table or Loading State */}
        {isLoading ? (
          <Alert color="info">Loading...</Alert>
        ) : (
          <>
            <Table className="bg-white">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Segment</th>
                  <th>Action Type</th>
                  <th>Size</th>
                  <th>Last Executed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((action) => (
                  <TableRow
                    key={action.id}
                    className="hover cursor-pointer text-sm"
                    onClick={() =>
                      handleNavigateToActionLogs(action.id, action.name,action.segment)
                    }
                  >
                    <td>{action.name}</td>
                    <td>{action.segment}</td>
                    <td>{action.actionType}</td>
                    <td>{action.size}</td>
                    <td>{new Date(action.lastExecuted).toLocaleString()}</td>
                    <td>
                      <Badge className="text-xs uppercase">{action.status}</Badge>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center gap-4 mt-6">
              <Button
                color="secondary"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="mx-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
               color="secondary"
               variant="outline"
               size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
