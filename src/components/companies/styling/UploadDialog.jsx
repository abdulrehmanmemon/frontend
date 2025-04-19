import { useState } from "react";
import Button from "../../daisyui/Button/Button";
import toast from "react-hot-toast";

export function UploadDialog({ onUpload, isOpen, setIsOpen }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length !== 3) {
      toast.error("Please upload exactly 3 PDF files.");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUpload = () => {
    if (files.length === 3) {
      onUpload(files);
      setIsOpen(false); 
    } else {
      toast.error("Please upload 3 PDF files.");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">Upload the last 3 annual filings</h3>

        <input
          type="file"
          accept=".pdf"
          multiple
          className="file-input file-input-bordered w-full mt-4"
          onChange={handleFileChange}
        />

        {/* Enhanced uploaded file list UI */}
        {files.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Uploaded Files:</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-white rounded shadow px-3 py-2">
                  <div className="flex items-center gap-2">
        
                    <span className="font-medium text-gray-800">{file.name}</span>
                    
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 ml-2 text-xs"
                    title="Remove file"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          
          </div>
        )}

        <div className="modal-action">
          <Button size="xs" color="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button size="xs" color="primary" onClick={handleUpload}>
            Confirm Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
