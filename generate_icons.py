# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw

def create_icon(filename, color, icon_type):
    """创建 TabBar 图标"""
    img = Image.new('RGBA', (81, 81), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 居中位置
    cx, cy = 40, 40
    
    if icon_type == 'home':
        # 房子图标 - 更简洁的线条设计
        # 屋顶（三角形）
        roof_points = [(15, 35), (40, 15), (65, 35)]
        draw.polygon(roof_points, outline=color, width=3)
        # 墙体（矩形）
        draw.rectangle([22, 35, 58, 60], outline=color, width=3)
        # 门
        draw.rectangle([33, 45, 47, 60], outline=color, width=2)
        # 烟囱
        draw.rectangle([50, 20, 56, 32], outline=color, width=2)
        
    elif icon_type == 'camera':
        # 相机图标 - 简洁线条
        # 机身
        draw.rounded_rectangle([10, 28, 71, 58], radius=5, outline=color, width=3)
        # 镜头
        draw.ellipse([28, 32, 53, 52], outline=color, width=3)
        draw.ellipse([34, 37, 47, 46], outline=color, width=2)
        # 闪光灯
        draw.ellipse([62, 30, 68, 36], fill=color)
        # 取景器
        draw.rounded_rectangle([18, 22, 32, 28], radius=2, outline=color, width=2)
        
    elif icon_type == 'user':
        # 用户图标 - 简洁线条
        # 头部
        draw.ellipse([28, 15, 53, 40], outline=color, width=3)
        # 身体（半圆弧）
        draw.arc([18, 38, 63, 70], start=0, end=180, fill=color, width=3)
        # 肩膀连接线
        draw.line([18, 58, 63, 58], fill=color, width=3)
    
    # 保存为 PNG
    img.save(filename, 'PNG')

# 创建 icons 目录（如果不存在）
import os
icons_dir = r'D:\AI拍照小程序\assets\icons'
os.makedirs(icons_dir, exist_ok=True)

# 定义颜色
black = (0, 0, 0, 255)      # 未选中 - 黑色
blue = (0, 122, 255, 255)   # 选中 - 蓝色

# 生成 6 个图标
create_icon(f'{icons_dir}/home.png', black, 'home')
create_icon(f'{icons_dir}/home-active.png', blue, 'home')
create_icon(f'{icons_dir}/camera.png', black, 'camera')
create_icon(f'{icons_dir}/camera-active.png', blue, 'camera')
create_icon(f'{icons_dir}/user.png', black, 'user')
create_icon(f'{icons_dir}/user-active.png', blue, 'user')

print('Done! 6 TabBar icons generated!')
