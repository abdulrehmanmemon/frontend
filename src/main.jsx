import "@/assets/css/main.css"; // Use theme's CSS for styling

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";  
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { FormProvider } from "./contexts/forms/ColdLeadActivationContext.jsx";
import { WorkflowFormProvider } from "./contexts/forms/WorkflowTemplateContext.jsx";
import { CaptureFXPaymentsProvider } from "./contexts/forms/CaptureFXPaymentsContext.jsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AuthProvider>
      <FormProvider>
        <WorkflowFormProvider>
          <CaptureFXPaymentsProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CaptureFXPaymentsProvider>
        </WorkflowFormProvider>
      </FormProvider>
    </AuthProvider>
  </StrictMode>
);
