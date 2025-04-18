import { FXExposureProvider } from '../../contexts/forms/FXExposureContext';
import { FXExposureTemplate } from './FXExposureTemplate';

const FXExposureWrapper = () => {
  return (
    <FXExposureProvider>
      <FXExposureTemplate />
    </FXExposureProvider>
  );
};

export default FXExposureWrapper; 