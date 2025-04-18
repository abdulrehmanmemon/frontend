import React, { useState } from "react";
import Button from "@/components/daisyui/Button/Button";

const SaveButton = ({ isFormComplete, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleClick = () => {
    if (isFormComplete) {
      setIsSaved(true);
      onSave(); // Call the save function
      setTimeout(() => setIsSaved(false), 3000); // Reset saved state after 3 seconds
    }
  };

  return (
    <Button
      onClick={handleClick}
      color={isSaved ? "neutral" : "primary"}
      variant="solid"
      size="md"
      fullWidth
      disabled={!isFormComplete || isSaved}
    >
      {isSaved ? "Saved" : "Save & Continue"}
    </Button>
  );
};

export default SaveButton;
