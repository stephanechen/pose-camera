// pages/index/index.js
const app = getApp();

Page({
  data: {
    showPermission: false
  },

  onLoad() {
    // 检查是否需要请求权限
    this.checkPermissions();
  },

  onShow() {
    // 检查全局参考图
    if (app.globalData.referenceImage) {
      // 如果有参考图，可以直接跳转
    }
  },

  // 检查权限
  checkPermissions() {
    wx.getSetting({
      success: (res) => {
        const cameraAuth = res.authSetting['scope.camera'];
        const albumAuth = res.authSetting['scope.writePhotosAlbum'];

        // 如果没有授权过任何权限，显示授权弹窗
        if (cameraAuth === undefined && albumAuth === undefined) {
          this.setData({ showPermission: true });
        }
      }
    });
  },

  // 显示权限弹窗
  showPermissionPopup() {
    this.setData({ showPermission: true });
  },

  // 隐藏权限弹窗
  hidePermission() {
    this.setData({ showPermission: false });
  },

  // 请求权限
  requestPermission() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success: () => {
            this.hidePermission();
            wx.showToast({
              title: '授权成功',
              icon: 'success'
            });
          },
          fail: () => {
            this.hidePermission();
          }
        });
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '需要相机权限才能使用此功能，请在设置中开启',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
        this.hidePermission();
      }
    });
  },

  // 上传参考图
  onUploadReference() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        console.log('选择参考图成功:', tempFilePath);

        // 保存到全局
        app.setReferenceImage(tempFilePath);

        // 跳转到取景页面
        wx.navigateTo({
          url: `/pages/camera/camera?image=${encodeURIComponent(tempFilePath)}`
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '请选择图片',
          icon: 'none'
        });
      }
    });
  },

  // 直接拍照（不需要参考图）
  onTakePhotoDirect() {
    // 跳转到取景页面，不传参考图
    wx.navigateTo({
      url: '/pages/camera/camera'
    });
  },

  // 阻止触摸穿透
  preventTouchMove() {
    return false;
  }
});
