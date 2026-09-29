/**
 * API请求工具函数
 * 统一处理API请求逻辑
 */

import axios from 'axios';
import { API_BASE_URL } from '../../config/api.js';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data;
  },
  error => {
    // 对响应错误做点什么
    console.error('API请求错误:', error);
    
    // 提取错误消息
    let errorMessage = '请求失败';
    if (error.response) {
      // 服务器返回了错误状态码
      errorMessage = error.response.data.message || `服务器错误 (${error.response.status})`;
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMessage = '网络错误，请检查网络连接';
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误';
    }
    
    // 返回统一的错误格式
    return Promise.reject({
      success: false,
      message: errorMessage,
      originalError: error
    });
  }
);

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 请求参数
 * @returns {Promise} 请求结果
 */
export const get = (url, params = {}) => {
  return apiClient.get(url, { params });
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
export const post = (url, data = {}) => {
  return apiClient.post(url, data);
};

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
export const put = (url, data = {}) => {
  return apiClient.put(url, data);
};

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} 请求结果
 */
export const del = (url, data = {}) => {
  return apiClient.delete(url, { data });
};

/**
 * 文件上传请求
 * @param {string} url - 请求URL
 * @param {FormData} formData - 表单数据
 * @returns {Promise} 请求结果
 */
export const upload = (url, formData) => {
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default {
  get,
  post,
  put,
  delete: del,
  upload
};