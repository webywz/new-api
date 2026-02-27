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
