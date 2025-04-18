import { useState } from "react";
import Button from "../../daisyui/Button/Button";

export function UploadDialog({ onUpload, isOpen, setIsOpen }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length !== 3) {
      alert("Please upload exactly 3 PDF files.");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUpload = () => {
    if (files.length === 3) {
      onUpload(files);
      setIsOpen(false); // Close modal
    } else {
      alert("Please upload 3 PDF files.");
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

        {/* Display uploaded file names */}
        {files.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h4 className="font-semibold">Uploaded Files:</h4>
            <ul className="list-disc list-inside">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {file.name}
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
