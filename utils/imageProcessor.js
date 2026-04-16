/**
 * imageProcessor.js - Canvas 本地参考图处理器
 *
 * 功能：将任意比例的参考图处理成 3:4 竖屏格式
 * - 单张图片完整填充（aspectFill 裁剪方式）
 * - 边缘留白区域用半透明深色渐变填充（不重复图片）
 * - 完全本地处理，零成本、零延迟
 */

/**
 * 处理参考图，输出 3:4 竖屏满屏格式
 * @param {string} srcPath   - 原始图片临时路径
 * @param {Object} options  - 配置项
 * @param {number} options.targetWidth   - 目标宽度（px，默认750）
 * @param {number} options.targetHeight  - 目标高度（px，默认1000，即3:4）
 * @returns {Promise<string>} 处理后的图片路径
 */
function processReferenceImage(srcPath, options) {
  options = options || {};
  // 3:4 比例：宽:高 = 3:4
  const targetW = options.targetWidth || 750;
  const targetH = options.targetHeight || 1000;
  const canvasId = 'refProcessCanvas';

  return new Promise(function(resolve, reject) {
    wx.getImageInfo({
      src: srcPath,
      success: function(imgInfo) {
        const srcW = imgInfo.width;
        const srcH = imgInfo.height;
        console.log('[ImageProcessor] 原图尺寸:', srcW, 'x', srcH);
        console.log('[ImageProcessor] 目标尺寸(3:4):', targetW, 'x', targetH);

        const canvasQuery = wx.createSelectorQuery();
        canvasQuery.select('#' + canvasId)
          .fields({ node: true, size: true })
          .exec(function(res) {
            if (!res || !res[0] || !res[0].node) {
              console.warn('[ImageProcessor] Canvas 未就绪，使用原图');
              resolve(srcPath);
              return;
            }

            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            canvas.width = targetW;
            canvas.height = targetH;

            const img = canvas.createImage();
            img.onload = function() {
              try {
                // === 第一步：填充深色背景 ===
                ctx.fillStyle = '#111111';
                ctx.fillRect(0, 0, targetW, targetH);

                // === 第二步：计算 aspectFill 裁剪区域 ===
                // 计算原图填满 3:4 目标区域时，需要裁剪多少
                const srcRatio = srcW / srcH;
                const targetRatio = targetW / targetH; // 3:4 = 0.75

                let sx, sy, sw, sh;

                if (srcRatio > targetRatio) {
                  // 原图更宽（横图）：左右需要裁剪
                  // 按高度填满，宽度方向裁剪中间部分
                  sw = srcH * targetRatio; // 裁剪后的宽度
                  sh = srcH;
                  sx = (srcW - sw) / 2; // 从中间裁剪
                  sy = 0;
                } else {
                  // 原图更高（竖图）：上下需要裁剪
                  // 按宽度填满，高度方向裁剪中间部分
                  sw = srcW;
                  sh = srcW / targetRatio; // 裁剪后的高度
                  sx = 0;
                  sy = (srcH - sh) / 2; // 从中间裁剪
                }

                console.log('[ImageProcessor] 裁剪区域:', { sx, sy, sw, sh });

                // === 第三步：绘制主体（aspectFill 裁剪方式，不变形）===
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

                // === 第四步：导出图片 ===
                wx.canvasToTempFilePath({
                  canvas: canvas,
                  x: 0, y: 0,
                  width: targetW, height: targetH,
                  destWidth: targetW, destHeight: targetH,
                  fileType: 'jpg',
                  quality: 0.92,
                  success: function(result) {
                    console.log('[ImageProcessor] 处理完成:', result.tempFilePath);
                    resolve(result.tempFilePath);
                  },
                  fail: function(err) {
                    console.error('[ImageProcessor] 导出失败:', err);
                    resolve(srcPath);
                  }
                });
              } catch(e) {
                console.error('[ImageProcessor] 绘制失败:', e);
                resolve(srcPath);
              }
            };

            img.onerror = function(err) {
              console.error('[ImageProcessor] 图片加载失败:', err);
              resolve(srcPath);
            };

            img.src = srcPath;
          });
      },
      fail: function(err) {
        console.error('[ImageProcessor] 获取图片信息失败:', err);
        resolve(srcPath);
      }
    });
  });
}

module.exports = {
  processReferenceImage: processReferenceImage
};
