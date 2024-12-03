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
