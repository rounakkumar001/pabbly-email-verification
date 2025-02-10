import axios from 'axios';
import Cookies from 'js-cookie';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl, withCredentials : true });

const fetchCsrfToken = async () => {
  try{
    let csrfToken = Cookies.get('XSRF-TOKEN');
    const response = await axios.get(`${CONFIG.site.serverUrl}/csrf-token`, {withCredentials : true});
    const {csrfToken : token} = response.data;
    csrfToken = token;
  
    Cookies.set('XSRF-TOKEN', csrfToken, {secure : false, sameSite : 'lax'});
  }
  catch (error){
    console.error('Failed to fetch CSRF token : ', error);
    throw new Error ('Unable to fetch CSRF token');
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    let csrfToken = Cookies.get('XSRF-TOKEN');

    if(config.url === '/auth/verify-session'){
      csrfToken = await fetchCsrfToken();
    }

    if(!['get', 'head', 'options'].includes(config.method) && csrfToken){
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  user : {
    timezone : '/users/set_timezone'
  },
  auth: {
    me: '/auth/verify-session',
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    logout: '/auth/logout',
  },
  bouncify : {
    credits : '/email-verification/credits',
    verifySingleEmail : '/email-verification/single',
    verificationLogs : '/email-verification/logs',
    uploadBulkEmail : '/email-verification/bulk-upload',
    startBulkEmailVerification : '/email-verification/bulk/start',
    checkBulkEmailVerificationStatus : '/email-verification/bulk/status',
    downloadCSV : '/email-verification/bulk/download',
    deleteEmailList : '/email-verification/bulk-list'
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
