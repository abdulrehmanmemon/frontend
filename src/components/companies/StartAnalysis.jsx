import { useState, useEffect } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import Button from "../daisyui/Button/Button";
import Card from "../daisyui/Card/Card";
import CardBody from "../daisyui/Card/CardBody";
import { UploadDialog } from "./styling/UploadDialog";
import { FiUpload } from "react-icons/fi";
import { supabaseSegments } from "../../helpers/supabaseClient";
import Progress from "../daisyui/Progress/Progress";
import { AiOutlineFileSearch } from "react-icons/ai";
import toast from 'react-hot-toast';

export default function StartAnalysis() {
  const location = useLocation();;
  const navigate = useNavigate(); 
  const { company_id, name } = location.state || {}; // Ensure company_id is available
  const analysisTypes = [
    { id: 1, name: "10K Analysis" },
    { id: 2, name: "Prepare 360 Report" },
    { id: 3, name: "Financial Statement Analysis" },
    { id: 4, name: "Credit Memo Draft" },
    { id: 5, name: "Due Diligence Report Draft" },
  ];
  ;
  const [selectedAnalysis, setSelectedAnalysis] = useState("1");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [fileIds, setFileIds] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const isSubmitDisabled = uploadedFiles.length !== 3;

  const ensureCompanyExists = async () => {
    try {
      if (!company_id || !name) {
        toast.error("Company ID or name is missing!");
        return null;
      }

      const { data: existingCompany, error: companyError } = await supabaseSegments
        .from("company")
        .select("company_id")
        .eq("company_id", company_id)
        .maybeSingle();
    
      if (companyError) {
        toast.error("Error checking company details");
        console.error("Error checking company:", companyError);
        return null;
      }
    
      if (existingCompany) {
        return existingCompany.company_id;
      }

      const { data: newCompany, error: insertError } = await supabaseSegments
        .from("company")
        .insert([{ company_id, name }])
        .select("company_id")
        .single();
    
      if (insertError) {
        toast.error("Error creating new company");
        console.error("Error inserting new company:", insertError);
        return null;
      }
    
      return newCompany.company_id;
    } catch (error) {
      toast.error("An unexpected error occurred while processing company details");
      console.error("Unexpected error:", error);
      return null;
    }
  };

  const handleUpload = async (files) => {
    try {
      if (!selectedAnalysis) {
        toast.error("Please select an analysis type first!");
        return;
      }
      setIsUploading(true);
    
      const validCompanyId = await ensureCompanyExists();
      if (!validCompanyId) {
        toast.error("Failed to verify or create company.");
        setIsUploading(false);
        return;
      }
    
      const { data: userData, error: userError } = await supabaseSegments.auth.getUser();
      if (userError) {
        toast.error("Error getting user information");
        console.error("Error getting user:", userError);
        setIsUploading(false);
        return;
      }
    
      const fileUploads = await Promise.all(
        files.map(async (file) => {
          const timestamp = Date.now(); // Using timestamp in milliseconds
          const uniqueFileName = `${timestamp}_${file.name}`;
          const filePath = `uploads/${validCompanyId}/${uniqueFileName}`;
        
          const { error: uploadError } = await supabaseSegments.storage
            .from("files")
            .upload(filePath, file);
          
          if (uploadError) {
            toast.error(`Upload Error: ${uploadError.message}`);
            return null;
          }
        
          const { data: publicUrlData } = supabaseSegments.storage
            .from("files")
            .getPublicUrl(filePath);
          
          return {
            company_id: validCompanyId,
            year: new Date().getFullYear(),
            file_path: publicUrlData.publicUrl,
            user_id: userData.user.id, // Fixed: using the correct user ID
            analysis_category: selectedAnalysis,
            file_name: file.name,
          };
        })
      );
    
      const validFileUploads = fileUploads.filter(Boolean);
      if (validFileUploads.length > 0) {
        const { data, error } = await supabaseSegments
          .from("file")
          .insert(validFileUploads)
          .select("id, file_name");
        
        if (error) {
          toast.error("Error saving file data");
          console.error("Error saving file data:", error);
        } else {
          toast.success("Files uploaded successfully!");
          setUploadedFiles(validFileUploads);
          setFileIds(data.map((file) => file.id));
          setFileNames(data.map((file) => file.file_name));
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred while uploading files");
      console.error("Unexpected error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (fileIds.length === 0) {
      toast.error("No files have been uploaded!");
      return;
    }
    navigate("/confirmation", { state: { fileIds,company_id,fileNames} });
  };

  const [fileNames, setFileNames] = useState([]); // New state for filenames

  useEffect(() => {
    if (fileIds.length > 0) {
      // Navigate to the next page once upload is successful
      navigate("/confirmation", { state: { fileIds, company_id, fileNames } });
    }
  }, [fileIds, navigate, company_id, fileNames]);

  return (
    <div className={`p-8 ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
      {isUploading && <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center text-white text-lg">Uploading files...</div>}
      <Progress value={20} max={100} className="mb-4" />
      <h1 className="text-2xl font-semibold mb-4">Start an analysis for {name}</h1>

      <div className="flex gap-4 mb-6">
        {analysisTypes.map((type) => {
          return (
            <Card
              key={type.id}
              className={`cursor-pointer p-4 border rounded-lg shadow-md w-1/2 ${
                selectedAnalysis === type.id ? "border-blue-500" : "border-gray-300"
              } ${type.name !== "10K Analysis" ? "opacity-50 cursor-not-allowed disabled" : ""}`}
              onClick={() => type.name === "10K Analysis" && setSelectedAnalysis(type.id)}
            >
              <CardBody className="flex items-center gap-2">
                <AiOutlineFileSearch className="w-8 h-8 text-md" /> 
                <p className="text-md text-center">{type.name}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>
      <div className="flex gap-4 mb-4">
        <Button
          onClick={() => setIsUploadDialogOpen(true)}
          className="flex items-center gap-2"
          color="secondary"
          disabled={isUploading}
        >
          <FiUpload className="w-5 h-5" /> Upload Files
        </Button>
      </div>

      {/* Upload Dialog */}
      {isUploadDialogOpen && (
        <UploadDialog
          onUpload={handleUpload}
          isOpen={isUploadDialogOpen}
          setIsOpen={setIsUploadDialogOpen}
        />
      )}
    </div>
  );
}
