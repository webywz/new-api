import axios from 'axios';
import { showError } from './utils';

// 创建独立的 Axios 实例，用于请求第三方或新后端接口
// 对应环境变量 VITE_REMOTE_API_URL，如果没有设置则默认为空字符串（即当前域名）
export const RemoteAPI = axios.create({
  baseURL: import.meta.env.VITE_REMOTE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：每次请求前先登录获取 Token
RemoteAPI.interceptors.request.use(async (config) => {
  try {
    // 使用独立的 axios 实例发起登录请求，避免死循环
    // 确保使用与当前请求相同的 baseURL
    const baseURL = config.baseURL || import.meta.env.VITE_REMOTE_API_URL || '';
    
    const loginResponse = await axios.post(
      '/api/v1/user/login',
      {
        account: "SuperAdmin",
        password: "SuperAdmin123"
      },
      {
        baseURL: baseURL,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 从响应中提取 access_token
    // 响应结构: { data: { token: { access_token: "..." } } }
    const token = loginResponse.data?.data?.token?.access_token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('RemoteAPI: Failed to retrieve access_token from login response');
    }
  } catch (error) {
    console.error('RemoteAPI: Pre-login failed', error);
    // 登录失败时，您可以选择抛出错误中断请求，或者让请求继续（可能会报 401）
    // return Promise.reject(error);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// 响应拦截器：保留统一的错误提示机制
RemoteAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果请求配置中显式要求跳过错误处理，则不弹出
    if (error.config && error.config.skipErrorHandler) {
      return Promise.reject(error);
    }
    showError(error);
    return Promise.reject(error);
  },
);
