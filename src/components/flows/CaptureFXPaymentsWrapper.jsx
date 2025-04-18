import { CaptureFXPaymentsProvider } from '../../contexts/forms/CaptureFXPaymentsContext';
import CaptureFXPayements from './CaptureFXPayements';

const CaptureFXPaymentsWrapper = () => {
  return (
    <CaptureFXPaymentsProvider>
      <CaptureFXPayements />
    </CaptureFXPaymentsProvider>
  );
};

export default CaptureFXPaymentsWrapper; 