import { useEffect, useState} from "react";
import { supabaseSegments } from "../../helpers/supabaseClient.js";
import { useNavigate } from "react-router-dom";
import React from "react";
import Button from "@/components/daisyui/Button/Button";
import Input from "@/components/daisyui/Input/Input";
import Badge from "@/components/daisyui/Badge/Badge";
import Alert from "@/components/daisyui/Alert/Alert";
import Table from "@/components/daisyui/Table/Table";
import TableRow from "@/components/daisyui/Table/TableRow";
import { Icon } from "../Icon";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown state for actions menu
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      setOpenDropdownId(null);
    }
    if (openDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdownId]);


  const handleArchive = async (segment) => {
    // Soft archive
    const { error } = await supabaseSegments
      .from("segments")
      .update({ status: "ARCHIVED" })
      .eq("id", segment.id);
    if (!error) {
      setSegments((prev) => prev.map((s) => s.id === segment.id ? { ...s, status: "ARCHIVED" } : s));
      setOpenDropdownId(null);
    } else {
      alert("Failed to archive segment: " + error.message);
    }
  };
  const handleActivate = async (segment) => {
    // Activate from archive
    const { error } = await supabaseSegments
      .from("segments")
      .update({ status: "ACTIVE" })
      .eq("id", segment.id);
    if (!error) {
      setSegments((prev) => prev.map((s) => s.id === segment.id ? { ...s, status: "ACTIVE" } : s));
      setOpenDropdownId(null);
    } else {
      alert("Failed to activate segment: " + error.message);
    }
  };
  const handleDelete = async (segment) => {
    // Soft delete
    const { error } = await supabaseSegments
      .from("segments")
      .update({ is_removed: true })
      .eq("id", segment.id);
    if (!error) {
      setSegments((prev) => prev.filter((s) => s.id !== segment.id));
      setOpenDropdownId(null);
    } else {
      alert("Failed to delete segment: " + error.message);
    }
  };

  // Fetch segments data with pagination
  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      setError(null);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      try {
        const query = supabaseSegments
          .from("segments")
          .select(
            "id, name, object_type:object_types(name), size, last_executed, status",
            { count: "exact" }
          );

        // Apply status filter if not "All"
        if (selectedStatus !== "All") {
          query.eq("status", selectedStatus.toUpperCase());
        }

        const { data, error, count } = await query.range(start, end);

        if (error){
          toast.error(error.message);
          return
        }

        const formattedData = data.map((segment) => ({
          ...segment,
          entity: segment.object_type ? segment.object_type.name : "N/A",
        }));

        setSegments(formattedData);
        setTotalCount(count);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [currentPage, selectedStatus]); // Re-fetch when page or status changes

  const handleAddSegment = () => {
    navigate("/segment-builder");
  };

  const filteredSegments = segments.filter((segment) => {
    const matchesStatus =
      selectedStatus === "All" ||
      (segment.status &&
        segment.status.toLowerCase() === selectedStatus.toLowerCase());
    const matchesSearch =
      searchQuery === "" ||
      segment.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const goToSegmentDetail = (segmentId) => {
    navigate(`/segments/${segmentId}`);
  };

  // Pagination Controls
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Segments</h1>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed w-fit flex mb-4">
          {['Active', 'Draft', 'Archived', 'All'].map((status) => (
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

        {/* Search Bar and Action Buttons */}
        <div className="flex justify-between items-center mb-4 mt-4">
          <Input
            type="text"
            placeholder="Search for a segment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <Button
            onClick={handleAddSegment}
            color="primary"
            variant="solid"
            size="md"
          >
            Add segment
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <Alert color="info">Loading...</Alert>
        ) : error ? (
          <Alert color="error" className="mb-4">
            Error: {error}
          </Alert>
        ) : (
          <Table className="table-auto w-full mt-4 bg-white">
            <thead>
              <tr>
                <th>Name</th>
                <th>Entity</th>
                <th>Size</th>
                <th>Last Executed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.length > 0 ? (
                filteredSegments.map((segment) => (
                  <TableRow key={segment.id} className="hover group">
                    <td
                      className="text-md font-bold cursor-pointer"
                      onClick={() => goToSegmentDetail(segment.id)}
                    >
                      {segment.name}
                    </td>
                    <td>{segment.entity}</td>
                    <td>{segment.size}</td>
                    <td>
                      {segment.last_executed
                        ? new Date(segment.last_executed).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>
                      <Badge className="text-xs uppercase">
                        {segment.status}
                      </Badge>
                    </td>
                    <td className="relative">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(segment.id === openDropdownId ? null : segment.id);
                        }}
                        className="cursor-pointer opacity-80 hover:opacity-100"
                        title="Actions"
                      >
                        <Icon icon="mdi:dots-vertical" width={20} height={20} />
                      </span>
                      {openDropdownId === segment.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-lg rounded z-10">
                          {segment.status === "ACTIVE" && (
                            <>
                             
                              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleArchive(segment)}>Archive</div>
                            </>
                          )}
                          {segment.status === "ARCHIVED" && (
                            <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleActivate(segment)}>Activate</div>
                          )}
                          {segment.status === "DRAFT" && (
                            <>
                             
                              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black" onClick={() => handleDelete(segment)}>Delete</div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No segments available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 space-x-2">
          <Button
            size="sm"
            color="secondary"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="self-center text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            color="secondary"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
