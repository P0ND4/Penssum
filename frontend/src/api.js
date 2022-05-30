import axios from 'axios';
import { socketio } from './components/helpers';

const API = process.env.REACT_APP_API_PENSSUM;
const io = socketio(API);

export const socket = io;

export const getUser = async (data) => {
    const result = await axios.post(`${API}/user/get`,data);
    return await result.data;
};

export const createUser = async (data) => {
    const result = await axios.post(`${API}/user/signup`, data);
    return await result.data;
};

export const deleteUser = async (id) => {
    const result = await axios.post(`${API}/user/delete`, { id });
    return await result.data;
};

export const changeMail = async (id,username,email) => {
    const result = await axios.post(`${API}/user/change/mail`, { id, username, email });
    return await result.data;
};


export const loginUser = async (data) => {
    const result = await axios.post(`${API}/user/signin`, data);
    return await result.data;
};

export const accountAuthentication = async (data) => {
    const result = await axios.post(`${API}/user/signup/authentication`, data);
    return await result.data;
};

export const tokenVerification = async (token) => {
    const result = await axios.post(`${API}/user/signup/token/verification`,{ token: token });
    return await result.data;
};

export const changePreferenceValue = async (data) => {
    const result = await axios.post(`${API}/user/change/preference/value`, data);
    return await result.data;
};

export const changePassword = async (data) => {
    const result = await axios.post(`${API}/user/change/password`, data);
    return await result.data;
};

export const searchUsers = async (data) => {
    const result = await axios.post(`${API}/search/users`, data);
    return await result.data;
}

export const getProducts = async (data) => {
    const result = await axios.post(`${API}/products`, data);
    return await result.data;
}

export const getAllUsers = async (search) => {
    const result = await axios.post(`${API}/search/all/users`, { search });
    return await result.data;
}

export const productCreate = async (data) => {
    const result = await axios.post(`${API}/product/create`, data);
    return await result.data;
}

export const increaseView = async (id) => {
    const result = await axios.post(`${API}/product/increase/view`, { id });
    return await result.data;
}

export const deleteProduct = async (data) => {
    const result = await axios.post(`${API}/product/remove`, data);
    return await result.data;
}

export const acceptProduct = async (id) => {
    const result = await axios.post(`${API}/product/accept`, { id });
    return await result.data;
}

export const fileSelection = async (data) => {
    const result = await axios.post(`${API}/product/file/selection`, data);
    return await result.data;
}

export const removeFiles = async (data) => {
    const result = await axios.post(`${API}/product/remove/files`, data);
    return await result.data;
}

export const makeOffer = async (data) => {
    const result = await axios.post(`${API}/product/make/offer`, data);
    return await result.data;
};

export const getOffer = async (data) => {
    const result = await axios.post(`${API}/product/offer`, data);
    return await result.data;
};

export const makeCounteroffer = async (data) => {
    const result = await axios.post(`${API}/product/make/counteroffer`, data);
    return await result.data;
};

export const acceptOffer = async (data) => {
    const result = await axios.post(`${API}/product/accept/offer`, data);
    return await result.data;
};

export const removeOffer = async (data) => {
    const result = await axios.post(`${API}/product/remove/offer`, data);
    return await result.data;
};

export const getAdminInformation = async (data) => {
    const result = await axios.post(`${API}/admin/information`, data);
    return await result.data;
};

export const getDashboardInformation = async () => {
    const result = await axios.post(`${API}/dashboard/information`);
    return await result.data;
};

export const getUsers = async () => {
    const result = await axios.post(`${API}/users`);
    return await result.data;
};

export const getNotifications = async (id) => {
    const result = await axios.post(`${API}/notifications`, { id });
    return await result.data;
};

export const getUncheckedMessages = async (id) => {
    const result = await axios.post(`${API}/unchecked/messages`, { id });
    return await result.data;
};

export const markUncheckedMessages = async id => {
    const result = await axios.post(`${API}/mark/unchecked/messages`, { id });
    return await result.data;
};

export const sendQuote = async (from, productId, files) => {
    const result = await axios.post(`${API}/product/send/quote`, { from, productId, files });
    return await result.data;
};

export const markNotification = async id => {
    const result = await axios.post(`${API}/mark/notification`, { id });
    return await result.data;
};

export const changePhoto = async image => {
    const result = await axios.post(`${API}/user/change/photo`, image);
    return await result.data;
};

export const blockUser = async data => {
    const result = await axios.post(`${API}/block/user`, data);
    return await result.data;
};

export const reviewBlocked = async data => {
    const result = await axios.post(`${API}/review/blocked`, data);
    return await result.data;
};

export const removeBlock = async data => {
    const result = await axios.post(`${API}/remove/block`, data);
    return await result.data;
};

export const sendReport = async data => {
    const result = await axios.post(`${API}/send/report`, data);
    return await result.data;
};

export const filterProducts = async data => {
    const result = await axios.post(`${API}/filter/product`, data);
    return await result.data;
};

export const checkAdminInformation = async data => {
    const result = await axios.post(`${API}/check/admin/information`, data);
    return await result.data;
};

export const changeDashboardPreference = async data => {
    const result = await axios.post(`${API}/administration/change/preference/value`, data);
    return await result.data;
};

export const changeDashboardPassword = async data => {
    const result = await axios.post(`${API}/administration/change/password`, data);
    return await result.data;
};

export const sendInformationAdmin = async data => {
    const result = await axios.post(`${API}/send/information/admin`, data);
    return await result.data;
};

export const sendWarning = async data => {
    const result = await axios.post(`${API}/send/warning`, data);
    return await result.data;
};

export const userStatusChange = async data => {
    const result = await axios.post(`${API}/user/status/change`, data);
    return await result.data;
};

export const suspensionControl = async data => {
    const result = await axios.post(`${API}/suspension/control`, data);
    return await result.data;
};

export const changeVideoCallURL = async data => {
    const result = await axios.post(`${API}/change/video_call/URL`, data);
    return await result.data;
};

export const payProduct = async data => {
    const result = await axios.post(`${API}/pay/product`, data);
    return await result.data;
};

export const banksAvailable = async () => {
    const result = await axios.post(`${API}/get/banks/available`);
    return await result.data;
};

export const getTransaction = async (data) => {
    const result = await axios.post(`${API}/get/transaction`, data);
    return await result.data;
};

export const removeTransaction = async (data) => {
    const result = await axios.post(`${API}/remove/transaction`, data);
    return await result.data;
};

export const saveTransaction = async (data) => {
    const result = await axios.post(`${API}/save/transaction`, data);
    return await result.data;
};

export const getVote = async (data) => {
    const result = await axios.post(`${API}/get/vote`, data);
    return await result.data;
};

export const vote = async (data) => {
    const result = await axios.post(`${API}/vote`, data);
    return await result.data;
};