// app.js - 静默登录版
App({
  globalData: {
    referenceImage: null,
    userConfig: { showGridLines: true, hapticFeedback: true },
    openid: null,
    isLogin: false
  },

  onLaunch() {
    this.loadConfig();
    this.silentLogin(); // 静默登录
  },

  // 静默登录（只获取 openid，不弹窗授权）
  silentLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取到登录 code:', res.code);
          // 调用后端接口换取 openid
          this.getOpenId(res.code);
        }
      },
      fail: (err) => {
        console.error('登录失败:', err);
      }
    });
  },

  // 后端换取 openid
  getOpenId(code) {
    // TODO: 替换为你的后端接口地址
    const API_BASE = 'https://your-api-domain.com';

    wx.request({
      url: `${API_BASE}/api/auth/wx-login`,
      method: 'POST',
      data: { code: code },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const { openid, token } = res.data.data;
          this.globalData.openid = openid;
          this.globalData.isLogin = true;
          wx.setStorageSync('openid', openid);
          wx.setStorageSync('access_token', token);
          console.log('静默登录成功，openid:', openid);
        } else {
          // 后端未接入，使用 code 作为临时标识
          console.log('后端未接入，本地模拟登录');
          const tempOpenid = 'temp_' + code.substring(0, 16);
          this.globalData.openid = tempOpenid;
          this.globalData.isLogin = true;
          wx.setStorageSync('openid', tempOpenid);
          wx.setStorageSync('access_token', 'local_' + Date.now());
        }
      },
      fail: () => {
        // 网络错误，使用本地临时 openid
        console.log('网络错误，本地模拟登录');
        const tempOpenid = 'temp_' + Date.now();
        this.globalData.openid = tempOpenid;
        this.globalData.isLogin = true;
        wx.setStorageSync('openid', tempOpenid);
        wx.setStorageSync('access_token', 'local_' + Date.now());
      }
    });
  },

  loadConfig() {
    try {
      const c = wx.getStorageSync('userConfig');
      if (c) this.globalData.userConfig = Object.assign(this.globalData.userConfig, c);
    } catch(e){ console.error(e); }
  },

  setReferenceImage(p) { this.globalData.referenceImage = p; },
  getReferenceImage() { return this.globalData.referenceImage; },

  saveUserConfig(c) {
    this.globalData.userConfig = Object.assign(this.globalData.userConfig, c || {});
    try{ wx.setStorageSync('userConfig', this.globalData.userConfig);}catch(e){console.error(e);}
  }
});
