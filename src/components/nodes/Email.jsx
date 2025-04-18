import React, { useEffect, useContext } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import Input from "@/components/daisyui/Input/Input";
import Textarea from "@/components/daisyui/Textarea/Textarea";

const Email = ({ instanceId, onSave }) => {
  const { emailData, setEmailData } = useContext(FormContext);

  useEffect(() => {
    if (!emailData[instanceId]) {
      setEmailData(instanceId, {
        recipientEmail: "",
        emailSubject: "",
        emailTemplate: "",
      });
    }
  }, [instanceId, emailData, setEmailData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData(instanceId, {
      ...emailData[instanceId],
      [name]: value,
    });
  };

  const isFormComplete = () => {
    const data = emailData[instanceId];
    return data?.recipientEmail?.trim() && 
           data?.emailSubject?.trim() && 
           data?.emailTemplate?.trim();
  };

  const handleSave = () => {
    if (!isFormComplete()) {
      alert("Please fill out all required fields before saving.");
      return;
    }

    onSave(instanceId, {
      ...emailData[instanceId],
      isFormComplete: true
    });
  };

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Email Notification</h3>

      <div className="space-y-4">
        {/* Recipient Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Email</label>
          <Input
            type="text"
            name="recipientEmail"
            value={emailData[instanceId]?.recipientEmail || ""}
            onChange={handleChange}
            placeholder="Enter email address or use {{customer.email}}"
            className="w-full input-sm"
          />
          
        </div>

        {/* Email Subject */}
        <div>
          <label className="block text-sm font-medium mb-2">Email Subject</label>
          <Input
            type="text"
            name="emailSubject"
            value={emailData[instanceId]?.emailSubject || ""}
            onChange={handleChange}
            placeholder="Enter subject"
            className="w-full input-sm"
          />
          
        </div>

        {/* Email Template */}
        <div>
          <label className="block text-sm font-medium mb-2">Email Template</label>
          <Textarea
            name="emailTemplate"
            value={emailData[instanceId]?.emailTemplate || ""}
            onChange={handleChange}
            placeholder="Enter email content with placeholders"
            rows={6}
            className="w-full text-sm"
          />
          
        </div>

        <div className="flex justify-center mt-4">
          <SaveButton onSave={handleSave} isFormComplete={isFormComplete()} />
        </div>
      </div>
    </Card>
  );
};

export default Email;
