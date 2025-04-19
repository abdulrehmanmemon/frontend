import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseSegments } from "../../helpers/supabaseClient.js";
import { FormContext } from "@/contexts/forms/WorkflowTemplateContext";

import toast from "react-hot-toast";
import Button from "@/components/daisyui/Button/Button";
import Input from "@/components/daisyui/Input/Input";
import Badge from "@/components/daisyui/Badge/Badge";
import Alert from "@/components/daisyui/Alert/Alert";
import Table from "@/components/daisyui/Table/Table";
import TableRow from "@/components/daisyui/Table/TableRow";
import { Icon } from "../Icon";

export default function Actions() {
  const [actions, setActions] = useState([]);
  const ctx = useContext(FormContext);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.action-dropdown')) {
        setOpenDropdownId(null);
      }
    }
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  // Handler stubs (add real logic as needed)
  const handleArchive = async (action) => {
    const { error } = await supabaseSegments
      .from("workflows")
      .update({ status: "ARCHIVED" })
      .eq("workflow_id", action.id);
    if (!error) {
      setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: "ARCHIVED" } : a));
      setOpenDropdownId(null);
    } else {
      alert("Failed to archive action: " + error.message);
    }
  };
  
  const handleActivate = async (action) => {
    const { error } = await supabaseSegments
      .from("workflows")
      .update({ status: "ACTIVE" })
      .eq("worklfow_id", action.id);
    if (!error) {
      setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: "ACTIVE" } : a));
      setOpenDropdownId(null);
    } else {
      alert("Failed to activate action: " + error.message);
    }
  };
  
  const handleDelete = async (action) => {
    const { error } = await supabaseSegments
      .from("workflows")
      .update({ is_removed: true })
      .eq("workflow_id", action.id);
    if (!error) {
      setActions((prev) => prev.filter((a) => a.id !== action.id));
      setOpenDropdownId(null);
    } else {
      alert("Failed to delete action: " + error.message);
    }
  };

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
        status: (item.status || "ACTIVE").toUpperCase(),
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

  const handleNavigateToActionLogs = async (workflowId, actionName, actionSegment) => {
    try {
      const normalizedSegment = actionSegment.trim();
      const { data: logsData, error: logsError } = await supabaseSegments
        .from("actions_executions")
        .select("*")
        .eq("workflow_id", workflowId);
      if (logsError) throw logsError;

      const { data: startNodeData, error: startNodeError } = await supabaseSegments
        .from("start_node_settings")
        .select("*")
        .eq("action_name", actionName);
      if (startNodeError) throw startNodeError;

      navigate("/actionLogs", {
        state: { logs: logsData, startNodes: startNodeData, normalizedSegment, workflowId },
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

  // Toggle dropdown
  const toggleDropdown = (e, actionId) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdownId(openDropdownId === actionId ? null : actionId);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Actions</h1>

        {/* Tabs for Filtering */}
        <div className="tabs tabs-boxed w-fit flex mb-4">
          {["Active", "Draft", "Archived", "All"].map((status) => (
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((action) => (
                  <TableRow
                    key={action.id}
                    className="hover cursor-pointer text-sm group"
                    onClick={() => handleNavigateToActionLogs(action.id, action.name, action.segment)}
                  >
                    <td>{action.name}</td>
                    <td>{action.segment}</td>
                    <td>{action.actionType}</td>
                    <td>{action.size}</td>
                    <td>{new Date(action.lastExecuted).toLocaleString()}</td>
                    <td><Badge className="text-xs uppercase">{action.status}</Badge></td>
                    <td className="relative">
                      <div className="action-dropdown">
                        <button
                          onClick={e => { e.stopPropagation(); toggleDropdown(e, action.id); }}
                          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                          aria-label="Action menu"
                        >
                          <Icon icon="mdi:dots-vertical" width={20} height={20} />
                        </button>
                        {openDropdownId === action.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none action-dropdown"
                            style={{ transform: 'translateZ(0)', background: 'white' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="py-1">
                              {action.status === "ACTIVE" && (
                                <>
                                  
                                  <button
                                    onClick={e => { e.stopPropagation(); handleArchive(action); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  >
                                    Archive
                                  </button>
                                </>
                              )}
                              {action.status === "ARCHIVED" && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleActivate(action); }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  Activate
                                </button>
                              )}
                                {action.status === "DRAFT" && (
  <button
    onClick={e => { e.stopPropagation(); handleDelete(action); }}
    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    Delete
  </button>
)}
                            
                            </div>
                          </div>
                        )}
                      </div>
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