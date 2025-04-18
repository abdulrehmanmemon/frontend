import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "@/components/daisyui/Button/Button";
import Modal from "@/components/daisyui/Modal/Modal";
import Input from "@/components/daisyui/Input/Input";
import Textarea from "@/components/daisyui/Textarea/Textarea";
import { supabaseSegments } from "../../helpers/supabaseClient";
import toast from "react-hot-toast";

export default function CreateAction() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flowTitle, setFlowTitle] = useState("");
  const [flowDescription, setFlowDescription] = useState("");
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch template flows from Supabase on mount
  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseSegments
          .from("workflowtemplates")
          .select("template_id, template_name, template_description")
          .eq("is_template", true); // Only fetch template flows

        if (error) {
          console.error("Error fetching workflow templates:", error);
        } else {
          setFlows(data.map(flow => ({
            id: flow.template_id,
            title: flow.template_name,
            description: flow.template_description || "No description available.",
          })));
        }
      } catch (error) {
        console.error("Error in fetchFlows:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  // Handle navigation back
  const handleBack = () => {
    navigate(-1);
  };

  // Handle flow card click
  const handleFlowClick = (flowId) => {
    navigate(`/flow/${flowId}`);
  };

  // Handle modal open
  const handleCreateAction = () => {
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFlowTitle("");
    setFlowDescription("");
  };

  // Handle saving a new flow
  const handleSaveFlow = async () => {
    if (!flowTitle.trim()) return;

    try {
      // Check if flow with the same title exists
      const { data: existingFlow, error: checkError } = await supabaseSegments
        .from("workflowtemplates")
        .select("template_name")
        .eq("template_name", flowTitle);

      if (checkError) {
        console.error("Error checking existing flow:", checkError);
        return;
      }

      if (existingFlow.length > 0) {
        toast.error("A flow with this title already exists. Please choose a different name.");
        return;
      }

      // Get user session details
      const { data: sessionData, error: sessionError } = await supabaseSegments.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error("User not logged in or session invalid");

      const userId = sessionData.session.user.id;

      const newFlow = {
        template_name: flowTitle,
        template_description: flowDescription || "No description provided.",
        user_id: userId,
        is_template: false, // Set is_template to false for user-created flows
      };

      // Insert new flow into Supabase
      const { data, error } = await supabaseSegments
        .from("workflowtemplates")
        .insert([newFlow])
        .select("*")
        .single();

      if (error) {
        console.error("Error inserting new flow:", error);
        return;
      }

      console.log("Flow saved successfully:", data);

      handleCloseModal();
      navigate(`/workflow-template`, { state: { flowData: data } });

    } catch (err) {
      console.error("Unexpected error inserting data:", err);
    }
  };

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      {/* Top Navigation Section */}
      <div className="flex items-center mb-8">
        <div className="breadcrumbs text-sm">
          <ul>
            <li><a onClick={() => navigate("/")}>Home</a></li>
            <li><a onClick={handleBack}>Agents</a></li>
            <li>Select Agent</li>
          </ul>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="text-left mb-10">
        <h1 className="text-3xl font-bold mb-4">Select pre-built action</h1>
      </div>

      {loading ? (
        <p>Loading flows...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* Render template flows */}
          {flows.map((flow) => (
            <div key={flow.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="card-body">
                <h2 className="card-title">{flow.title}</h2>
                <p>{flow.description}</p>
                <div className="card-actions justify-end pt-4">
                  <button className="btn btn-outline btn-sm btn-secondary" onClick={() => handleFlowClick(flow.id)}>
                    {">"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Action Button */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer border-2 border-dashed border-primary/40">
            <div className="card-body flex flex-col items-center justify-center text-center h-full" onClick={handleCreateAction}>
              <div className="rounded-full bg-primary/10 p-4 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-6-6h12" />
                </svg>
              </div>
              <h2 className="card-title text-primary mb-2">Create new template</h2>
              <p className="text-gray-500">Start from scratch and create your custom agent</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Action */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <div>
          <h3 className="font-bold text-lg">Create new agent</h3>
          <Input
            type="text"
            placeholder="Enter flow title"
            className="input-bordered w-full mt-4 text-sm"
            value={flowTitle}
            onChange={(e) => setFlowTitle(e.target.value)}
          />
          <Textarea
            placeholder="Enter flow description"
            className="textarea-bordered w-full mt-4 text-sm"
            value={flowDescription}
            onChange={(e) => setFlowDescription(e.target.value)}
          />
          <div className="modal-action">
            <Button color="secondary" onClick={handleCloseModal} size="sm">Cancel</Button>
            <Button color="primary" onClick={handleSaveFlow} size="sm">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
