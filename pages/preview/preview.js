// pages/preview/preview.js
Page({
  data: {
    photoPath: '',
    saved: false,
    saving: false
  },

  onLoad(opts) {
    if (opts.photo) {
      this.setData({ photoPath: decodeURIComponent(opts.photo) });
    }
  },

  goBack() { wx.navigateBack(); },

  retakePhoto() { wx.navigateBack(); },

  onImageError() { wx.showToast({ title:'图片加载失败', icon:'none' }); },

  savePhoto() {
    const self = this;
    this.setData({ saving: true });
    wx.saveImageToPhotosAlbum({
      filePath: this.data.photoPath,
      success: function() {
        self.setData({ saved: true, saving: false });
        wx.vibrateShort({ type: 'medium' });
      },
      fail: function(e) {
        self.setData({ saving: false });
        if (e.errMsg && (e.errMsg.includes('auth deny') || e.errMsg.includes('deny'))) {
          wx.showModal({
            title: '需要授权',
            content: '允许保存图片到相册',
            confirmText: '去设置',
            success: function(r) {
              if (r.confirm) wx.openSetting();
            }
          });
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      }
    });
  }
});
