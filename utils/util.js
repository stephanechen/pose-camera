// utils/util.js

/**
 * 格式化日期时间
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 深拷贝对象
 * @param {Object} obj 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 节流函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, wait = 300) {
  let timeout = null;
  let previous = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay = 300) {
  let timeout = null;
  
  return function(...args) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 获取图片信息
 * @param {string} filePath 图片路径
 * @returns {Promise<Object>} 图片信息
 */
function getImageInfo(filePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: filePath,
      success: resolve,
      fail: reject
    });
  });
}

/**
 * 压缩图片
 * @param {string} filePath 图片路径
 * @param {number} quality 质量（0-100）
 * @param {number} maxWidth 最大宽度
 * @param {number} maxHeight 最大高度
 * @returns {Promise<string>} 压缩后的图片路径
 */
async function compressImage(filePath, quality = 80, maxWidth = 1920, maxHeight = 1920) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: filePath,
      quality: quality,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (err) => {
        // 如果压缩失败，返回原图
        console.warn('图片压缩失败，使用原图:', err);
        resolve(filePath);
      }
    });
  });
}

/**
 * 计算两点之间的距离
 * @param {number} x1 点1 x坐标
 * @param {number} y1 点1 y坐标
 * @param {number} x2 点2 x坐标
 * @param {number} y2 点2 y坐标
 * @returns {number} 距离
 */
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算角度（弧度转角度）
 * @param {number} radian 弧度
 * @returns {number} 角度
 */
function radianToAngle(radian) {
  return radian * 180 / Math.PI;
}

/**
 * 计算角度（角度转弧度）
 * @param {number} angle 角度
 * @returns {number} 弧度
 */
function angleToRadian(angle) {
  return angle * Math.PI / 180;
}

/**
 * 限制数值在范围内
 * @param {number} value 值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 限制后的值
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 显示加载提示
 * @param {string} title 提示文字
 */
function showLoading(title = '加载中...') {
  if (wx.showLoading) {
    wx.showLoading({ title, mask: true });
  } else {
    wx.showToast({ title, icon: 'loading', duration: 10000 });
  }
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  if (wx.hideLoading) {
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}

/**
 * 显示成功提示
 * @param {string} title 提示文字
 */
function showSuccess(title = '成功') {
  wx.showToast({ title, icon: 'success' });
}

/**
 * 显示错误提示
 * @param {string} title 提示文字
 */
function showError(title = '出错了') {
  wx.showToast({ title, icon: 'none' });
}

/**
 * 权限检查
 * @param {string} permission 权限名称
 * @returns {Promise<boolean>} 是否有权限
 */
async function checkPermission(permission) {
  try {
    const setting = await wx.getSetting();
    return setting.authSetting[permission] === true;
  } catch (e) {
    return false;
  }
}

/**
 * 请求权限
 * @param {string} permission 权限名称
 * @returns {Promise<boolean>} 是否授权成功
 */
async function requestPermission(permission) {
  try {
    const result = await wx.authorize({ scope: permission });
    return true;
  } catch (e) {
    // 引导用户到设置页面开启权限
    wx.showModal({
      title: '需要授权',
      content: '请允许相关权限以继续使用',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting();
        }
      }
    });
    return false;
  }
}

// 导出工具函数
module.exports = {
  formatDate,
  deepClone,
  throttle,
  debounce,
  getImageInfo,
  compressImage,
  distance,
  radianToAngle,
  angleToRadian,
  clamp,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  checkPermission,
  requestPermission
};
