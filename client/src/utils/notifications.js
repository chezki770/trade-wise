import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuration for toast notifications
const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export const showSuccessToast = (message) => {
    toast.success(message, toastConfig);
};

export const showErrorToast = (message) => {
    toast.error(message, toastConfig);
};

export const showInfoToast = (message) => {
    toast.info(message, toastConfig);
};

export const showDetailedErrorToast = (message, technicalDetails = null) => {
    const config = {
        ...toastConfig,
        autoClose: 5000, // Give users more time to read detailed errors
    };
    
    if (technicalDetails && process.env.NODE_ENV === 'development') {
        toast.error(
            <div>
                <div>{message}</div>
                <div style={{ fontSize: '0.8em', marginTop: '8px', color: '#ff9999' }}>
                    Technical details: {technicalDetails}
                </div>
            </div>,
            config
        );
    } else {
        toast.error(message, config);
    }
};
