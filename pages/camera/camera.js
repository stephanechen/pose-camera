// pages/camera/camera.js - 修复版
const app = getApp();

Page({
  data: {
    // 相机
    cameraPosition: 'back',
    flashMode: 'off',
    flashModeText: '关',
    zoomLevel: 1,        // UI显示的倍数（用于UI高亮）
    actualZoom: 1,       // 实际传给Camera的zoom值（范围[1, maxZoom]）
    maxZoom: 5,          // 设备支持的最大zoom
    mode: 'normal',
    zoomLevels: [0.8, 1, 2, 5],  // 苹果风格倍数选项

    // 参考图
    referenceImage: '',
    showReference: true,
    transparencyPercent: 50,
    referenceOpacity: 0.5,

    // 变换
    refOffsetX: 0,
    refOffsetY: 0,
    refScale: 1,

    // UI
    showGridLines: true,
    hapticFeedback: true,
    showTransparencyPanel: false,
    showSettings: false,
    showSelectPopup: false,
    showFocusBox: false,
    focusX: 0,
    focusY: 0,
    albumPreview: '',
    presets: [20, 30, 40, 50, 60, 70, 80],

    gesture: {}
  },

  onLoad() {
    this.cameraCtx = wx.createCameraContext();
    const cfg = app.globalData.userConfig || {};
    this.setData({
      showGridLines: cfg.showGridLines !== false,
      hapticFeedback: cfg.hapticFeedback !== false
    });
  },

  onReady() {
    console.log('camera ready');
    this.cameraCtx = wx.createCameraContext();
  },

  onCameraError(e) {
    console.error('相机错误:', e);
    wx.showToast({ title: '相机错误', icon: 'none' });
  },

  onCameraInitDone(e) {
    console.log('相机初始化完成', e.detail);
    // 获取设备支持的zoom范围
    if (e.detail) {
      const maxZoom = e.detail.maxZoom || e.detail.max || 5;
      const minZoom = e.detail.minZoom || e.detail.min || 1;
      console.log('设备支持 zoom 范围:', minZoom, '-', maxZoom);
      this.setData({
        maxZoom: maxZoom,
        actualZoom: this.data.zoomLevel < 1 ? 1 : Math.min(this.data.zoomLevel, maxZoom)
      });
      // 初始化时设置默认缩放
      if (this.cameraCtx) {
        this.cameraCtx.setZoom({
          zoom: this.data.actualZoom
        });
      }
    }
  },

  // ==================== 拍照 ====================

  onTakePhoto() {
    if (this.data.mode === 'video') {
      wx.showToast({ title: '视频模式开发中', icon: 'none' });
      return;
    }

    this.triggerHaptic();
    this.cameraCtx.takePhoto({
      quality: 'high',
      success: (res) => {
        wx.vibrateShort({ type: 'medium' });
        wx.navigateTo({
          url: `/pages/preview/preview?photo=${encodeURIComponent(res.tempImagePath)}`
        });
      },
      fail: (e) => {
        console.error('拍照失败:', e);
        wx.showToast({ title: '拍照失败', icon: 'none' });
      }
    });
  },

  // ==================== 相机控制 ====================

  switchCamera() {
    this.setData({
      cameraPosition: this.data.cameraPosition === 'back' ? 'front' : 'back'
    });
    this.triggerHaptic();
  },

  // ==================== 倍数切换（苹果风格） ====================

  onZoomTap(e) {
    const zoom = parseFloat(e.currentTarget.dataset.zoom);
    console.log('切换倍数:', zoom, 'maxZoom:', this.data.maxZoom);

    // 更新UI显示
    this.setData({ zoomLevel: zoom });

    // 使用 CameraContext.setZoom() API 设置实际缩放（范围[1, maxZoom]）
    let actualZoom = zoom < 1 ? 1 : zoom; // 小于1的映射到1
    if (actualZoom > this.data.maxZoom) {
      actualZoom = this.data.maxZoom;
    }
    
    this.setData({ actualZoom: actualZoom });

    if (this.cameraCtx) {
      this.cameraCtx.setZoom({
        zoom: actualZoom,
        success: (res) => {
          console.log('setZoom 成功，实际设置值:', res.zoom);
          wx.showToast({
            title: `${zoom}x`,
            icon: 'none',
            duration: 600
          });
        },
        fail: (err) => {
          console.error('setZoom 失败:', err);
          wx.showToast({
            title: '缩放失败',
            icon: 'none'
          });
        }
      });
    }

    this.triggerHaptic();
  },

  toggleFlash() {
    const modes = ['off', 'on', 'auto'];
    const texts = ['关', '开', '自动'];
    const i = modes.indexOf(this.data.flashMode);
    const ni = (i + 1) % 3;
    this.setData({ flashMode: modes[ni], flashModeText: texts[ni] });
    this.triggerHaptic();
  },

  // ==================== 参考图 ====================

  // 选择参考图选项处理
  onSelectOption(e) {
    const type = e.currentTarget.dataset.type;
    console.log('选择类型:', type);
    
    this.setData({ showSelectPopup: false });
    const self = this;

    if (type === 'album') {
      wx.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: function(res) {
          console.log('从相册选择成功:', res.tempFilePaths);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            self.loadRefImage(res.tempFilePaths[0]);
          }
        },
        fail: function(err) {
          console.error('选择失败:', err);
          wx.showToast({ title: '打开相册失败', icon: 'none' });
        }
      });
    } else if (type === 'camera') {
      wx.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: function(res) {
          console.log('拍摄成功:', res.tempFilePaths);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            self.loadRefImage(res.tempFilePaths[0]);
          }
        },
        fail: function(err) {
          console.error('拍摄失败:', err);
          wx.showToast({ title: '拍摄失败', icon: 'none' });
        }
      });
    }
  },

  // 兼容旧方法
  chooseFromAlbum() {
    this.onSelectOption({ currentTarget: { dataset: { type: 'album' } } });
  },

  // 兼容旧方法
  captureReference() {
    this.onSelectOption({ currentTarget: { dataset: { type: 'camera' } } });
  },

  // 加载参考图（直接显示原图，不处理）
  loadRefImage(srcPath) {
    console.log('加载参考图（原图）:', srcPath);

    // 直接使用原图，不经过 imageProcessor 处理
    app.setReferenceImage && app.setReferenceImage(srcPath);
    this.setData({
      referenceImage: srcPath,
      albumPreview: srcPath,
      refOffsetX: 0,
      refOffsetY: 0,
      refScale: 1,
      showReference: true
    });
    wx.showToast({ title: '参考图已加载', icon: 'success' });
  },

  toggleReference() {
    this.setData({ showReference: !this.data.showReference });
    this.triggerHaptic();
  },

  removeReference() {
    wx.showModal({
      title: '删除参考图',
      content: '确定要删除当前参考图吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ referenceImage: '', albumPreview: '' });
        }
      }
    });
  },

  // 透明度面板中的删除方法
  onDeleteReference() {
    this.setData({ 
      referenceImage: '', 
      albumPreview: '',
      showTransparencyPanel: false 
    });
    wx.showToast({ title: '已删除参考图', icon: 'none' });
  },

  resetReference() {
    this.setData({ refOffsetX: 0, refOffsetY: 0, refScale: 1 });
    this.triggerHaptic();
  },

  fitToScreen() {
    this.setData({ refScale: 0.85, refOffsetX: 0, refOffsetY: 0 });
    this.triggerHaptic();
  },

  // ==================== 透明度 ====================

  toggleTransparencyPanel() {
    this.setData({ showTransparencyPanel: !this.data.showTransparencyPanel });
  },

  hideTransparencyPanel() {
    this.setData({ showTransparencyPanel: false });
  },

  onTransparencyChange(e) {
    const v = e.detail.value;
    this.setData({ transparencyPercent: v, referenceOpacity: v / 100 });
  },

  setTransparencyPreset(e) {
    console.log('setTransparencyPreset:', e.currentTarget.dataset);
    const v = parseInt(e.currentTarget.dataset.value, 10);
    console.log('设置透明度:', v);
    this.setData({ transparencyPercent: v, referenceOpacity: v / 100 });
    this.triggerHaptic();
  },

  // ==================== 手势 ====================

  onReferenceTouchStart(e) {
    const t = e.touches;
    this.gestureInfo = t.length === 1
      ? { lastT: t, ox: this.data.refOffsetX, oy: this.data.refOffsetY }
      : {
          lastT: t,
          s: this.data.refScale,
          dist: Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y),
          ox: this.data.refOffsetX,
          oy: this.data.refOffsetY
        };
  },

  onReferenceTouchMove(e) {
    const t = e.touches;
    if (!t.length || !this.gestureInfo) return;

    if (t.length === 1) {
      this.setData({
        refOffsetX: this.gestureInfo.ox + t[0].clientX - this.gestureInfo.lastT[0].clientX,
        refOffsetY: this.gestureInfo.oy + t[0].clientY - this.gestureInfo.lastT[0].clientY
      });
    } else {
      const d = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
      const ns = Math.max(0.3, Math.min(3, this.gestureInfo.s * (d / this.gestureInfo.dist)));
      this.setData({ refScale: ns });
    }
  },

  onReferenceTouchEnd() {
    if (this.data.hapticFeedback) wx.vibrateShort({ type: 'light' });
  },

  // ==================== 上传弹窗 ====================

  showUploadOptions() {
    this.setData({ showSelectPopup: true });
  },

  hideSelectPopup() {
    this.setData({ showSelectPopup: false });
  },

  // ==================== 设置/弹窗 ====================

  toggleGrid() {
    this.setData({ showGridLines: !this.data.showGridLines });
    this.triggerHaptic();
  },

  openAlbum() {
    const self = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        self.setData({ albumPreview: res.tempFilePaths[0] });
      }
    });
  },

  hideAllPopups() {
    this.setData({
      showTransparencyPanel: false,
      showSettings: false,
      showSelectPopup: false
    });
  },

  triggerHaptic() {
    if (this.data.hapticFeedback) wx.vibrateShort({ type: 'light' });
  },

  preventMove() {
    return false;
  },

  noop() {
    // 空方法，用于阻止事件冒泡
  }
});
