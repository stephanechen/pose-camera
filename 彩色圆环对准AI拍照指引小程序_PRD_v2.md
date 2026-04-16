# 「彩色圆环对准」AI拍照指引小程序 · 产品需求文档（PRD）

> **版本**：v2.0.0  
> **更新日期**：2025年1月  
> **核心升级**：集成智能Skill系统 + 小红书持续学习引擎

---

## 文档信息

| 项目名称 | 彩色圆环对准 AI拍照指引小程序 |
|---------|---------------------------|
| 文档版本 | v2.0.0 |
| 创建日期 | 2025年1月 |
| 文档状态 | 待评审 |
| 核心对标 | Doka相机、小红书拍照功能 |

---

## 一、产品概述

### 1.1 产品定位

一款**AI智能构图指引拍照小程序**，核心创新点：

```
┌─────────────────────────────────────────────────────────────────┐
│                    产品核心价值主张                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📷 实时AI构图指引 → 彩色圆环对准，零学习成本                     │
│                                                                 │
│   🎯 智能Skill系统 → 学习小红书爆款技巧，自动推荐最优构图          │
│                                                                 │
│  🔄 持续进化能力 → 每日爬取高赞帖子，知识库自动更新                │
│                                                                 │
│   🎨 联动滤镜推荐 → 对准即出片，小红书同款氛围感                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 产品架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        产品架构全景图                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     用户交互层                                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│  │  │相机取景  │  │圆环指引  │  │滤镜预览  │  │照片管理  │        │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Skill执行引擎                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │ 场景识别     │  │ Skill匹配   │  │ 参数输出     │         │   │
│  │  │ (AI Vision) │→ │ (向量检索)  │→ │ (执行指令)   │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Skill知识库                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │ 构图Skill   │  │ 姿势Skill   │  │ 场景Skill   │  ...    │   │
│  │  │ (100+)      │  │ (50+)       │  │ (80+)       │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                ▲                                    │
│                                │                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                小红书持续学习引擎 🔥 NEW                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │ 内容爬取     │  │ AI知识抽取  │  │ Skill生成   │         │   │
│  │  │ (每日更新)  │  │ (LLM解析)   │  │ (自动入库)  │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、Skill系统设计

### 2.1 Skill是什么？

> **Skill = 从小红书高赞摄影帖子中提取的结构化拍照技巧**
> 
> AI可以读取、理解、执行的"拍照能力单元"

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill结构示意图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  输入（触发条件）              输出（执行参数）                    │
│  ┌─────────────┐            ┌─────────────┐                    │
│  │ 场景：咖啡馆 │            │ 圆环位置    │                    │
│  │ 主体：人像   │   Skill    │ 滤镜推荐    │                    │
│  │ 光线：柔和   │ ────────→  │ 指引文案    │                    │
│  │             │            │ 姿势建议    │                    │
│  └─────────────┘            └─────────────┘                    │
│                                                                 │
│  来源：小红书「咖啡馆拍照教程」点赞2.3万                          │
│  学习时间：2025-01-15                                          │
│  使用次数：12,345次 | 成功率：87%                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Skill完整数据结构

```json
{
  "skill_id": "skill_scene_cafe_portrait_001",
  "skill_name": "咖啡馆窗边人像构图",
  "skill_type": "scene",
  "version": "v1.2.0",
  
  "source": {
    "platform": "xiaohongshu",
    "post_id": "65a1b2c3d4e5f6",
    "post_url": "https://www.xiaohongshu.com/explore/65a1b2c3d4e5f6",
    "author": "摄影师小王",
    "author_followers": 125000,
    "likes": 23000,
    "collects": 8500,
    "comments": 456,
    "learned_at": "2025-01-15T10:00:00Z"
  },
  
  "trigger_conditions": {
    "scene_tags": ["cafe", "indoor", "window", "coffee"],
    "subject_type": ["person"],
    "lighting_condition": ["soft", "bright"],
    "required_confidence": 0.7
  },
  
  "knowledge": {
    "summary": "利用咖啡馆窗边柔和自然光，配合简约背景，拍出文艺清新人像",
    "principles": [
      "选择靠窗位置，利用柔和侧光",
      "背景选择简约墙面或书架",
      "人物侧身45度面向窗户",
      "手拿咖啡杯增加生活感"
    ],
    "key_learnings": [
      "侧光比正面光更有立体感",
      "窗边光线柔和不生硬",
      "手持道具更自然"
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": { "x": 0.4, "y": 0.45, "radius": 0.12 },
      "grid_type": "rule_of_thirds",
      "guide_lines": [
        { "type": "vertical", "position": 0.333 },
        { "type": "vertical", "position": 0.667 }
      ]
    },
    "pose_guide": {
      "head_tilt": "slight_left",
      "body_angle": 45,
      "hand_placement": ["拿咖啡杯", "翻书", "托腮", "扶眼镜"],
      "gaze_direction": "away_right"
    },
    "camera_settings": {
      "zoom": 1.5,
      "aspect_ratio": "3:4",
      "height_suggestion": "eye_level"
    },
    "filter_recommendation": {
      "filter_id": "filter_cafe_warm_01",
      "filter_name": "咖啡馆暖调",
      "params": {
        "temperature": 6200,
        "tint": 15,
        "exposure": 0.1,
        "contrast": 1.1,
        "saturation": 0.95
      },
      "confidence": 0.9
    }
  },
  
  "guidance": {
    "voice_templates": [
      { "condition": "光线不足", "text": "请移动到窗边，利用自然光线" },
      { "condition": "背景杂乱", "text": "请调整角度，避开背后杂物" },
      { "condition": "姿势僵硬", "text": "可以拿杯咖啡，会更自然" },
      { "condition": "已对准", "text": "完美！窗边光线很棒，可以拍摄" }
    ],
    "success_message": "✅ 构图达标！咖啡馆氛围感拉满"
  },
  
  "analytics": {
    "usage_count": 12345,
    "success_rate": 0.87,
    "avg_user_rating": 4.6,
    "last_used_at": "2025-01-20T15:30:00Z"
  },
  
  "embedding_vector": [0.123, 0.456, "..."]
}
```

### 2.3 Skill分类体系

```
photo_skills/
├── composition/          # 构图类（120+ Skills）
│   ├── skill_rule_of_thirds_001        # 三分法构图
│   ├── skill_center_composition_001    # 中心构图
│   ├── skill_golden_ratio_001          # 黄金分割
│   ├── skill_symmetry_001              # 对称构图
│   ├── skill_leading_lines_001         # 引导线构图
│   ├── skill_frame_within_frame_001    # 框架构图
│   ├── skill_negative_space_001        # 留白构图
│   └── skill_diagonal_001              # 对角线构图
│
├── pose/                 # 姿势类（80+ Skills）
│   ├── skill_portrait_standing_001     # 站姿人像
│   ├── skill_portrait_sitting_001      # 坐姿人像
│   ├── skill_portrait_walking_001      # 走路动态
│   ├── skill_couple_intimate_001       # 情侣亲密
│   ├── skill_group_casual_001          # 多人随性
│   └── skill_hand_pose_natural_001     # 手部姿势
│
├── scene/                # 场景类（150+ Skills）
│   ├── skill_scene_cafe_001            # 咖啡馆
│   ├── skill_scene_street_001          # 街拍
│   ├── skill_scene_beach_001           # 海边
│   ├── skill_scene_forest_001          # 森林
│   ├── skill_scene_restaurant_001      # 餐厅
│   ├── skill_scene_museum_001          # 博物馆
│   ├── skill_scene_flower_field_001    # 花田
│   └── skill_scene_night_city_001      # 城市夜景
│
├── lighting/             # 光线类（60+ Skills）
│   ├── skill_golden_hour_001           # 黄金时刻
│   ├── skill_backlight_001             # 逆光
│   ├── skill_window_light_001          # 窗边光
│   ├── skill_night_neon_001            # 霓虹夜景
│   └── skill_overcast_soft_001         # 阴天柔光
│
├── filter/               # 滤镜类（100+ Skills）
│   ├── skill_filter_warm_portrait_001  # 暖调人像
│   ├── skill_filter_cool_street_001    # 冷调街拍
│   ├── skill_filter_vintage_001        # 复古胶片
│   ├── skill_filter_cinematic_001      # 电影感
│   └── skill_filter_fresh_001          # 清新明亮
│
└── food/                 # 美食类（80+ Skills）
    ├── skill_food_topdown_001          # 美食俯拍
    ├── skill_food_closeup_001          # 美食特写
    ├── skill_food_hand_held_001        # 手持美食
    └── skill_food_table_setting_001    # 餐桌摆盘
```

### 2.4 Skill执行流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Skill实时执行流程                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户打开相机                                                        │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 1: 场景识别（200ms内）                                  │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  AI Vision分析实时帧：                                        │   │
│  │    • 主体检测 → person / food / product / landscape          │   │
│  │    • 场景分类 → cafe / street / beach / indoor / outdoor     │   │
│  │    • 光线分析 → soft / bright / backlight / golden_hour      │   │
│  │    • 色彩分析 → warm / cool / vibrant / muted                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 2: Skill检索（50ms内）                                  │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  输入：{ scene: "cafe", subject: "person", light: "soft" }    │   │
│  │  处理：                                                      │   │
│  │    1. 向量相似度搜索 → Top-5 候选Skills                       │   │
│  │    2. 规则过滤 → 匹配trigger_conditions                       │   │
│  │    3. 质量排序 → 按成功率×热度综合评分                         │   │
│  │  输出：skill_scene_cafe_portrait_001 (score: 0.94)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 3: 参数执行（30ms内）                                   │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  从Skill.execution提取：                                      │   │
│  │    • ring_position: { x: 0.4, y: 0.45 }                      │   │
│  │    • filter: filter_cafe_warm_01                             │   │
│  │    • voice: "请移动到窗边，利用自然光线"                       │   │
│  │    • pose: "手拿咖啡杯，侧身45度"                              │   │
│  │                                                              │   │
│  │  计算当前主体与目标位置偏移 → 生成移动指引                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 4: UI渲染（20ms内）                                     │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  • 圆环移动到目标位置                                          │   │
│  │  • 显示方向箭头                                                │   │
│  │  • 播放语音提示                                                │   │
│  │  • 预览滤镜效果                                                │   │
│  │  • 显示姿势建议卡片                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  用户对准 → 震动反馈 → 拍照 → 应用滤镜 → 保存/分享                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 三、小红书持续学习引擎 🔥

### 3.1 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                  小红书持续学习引擎架构                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Layer 1: 内容爬取层（每日执行）                              │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ 关键词    │  │ 高赞帖子  │  │ 热门话题  │  │ 达人账号  │    │   │
│  │  │ 搜索     │  │ 监控     │  │ 追踪     │  │ 关注     │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │       │              │              │              │         │   │
│  │       └──────────────┼──────────────┼──────────────┘         │   │
│  │                      ▼                                      │   │
│  │              ┌──────────────┐                               │   │
│  │              │  内容队列     │  ← 日均1000+帖子               │   │
│  │              └──────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Layer 2: 内容解析层                                         │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  多模态AI解析（图文 + 视频）                            │  │   │
│  │  │                                                       │  │   │
│  │  │  图文帖：                                              │  │   │
│  │  │    • OCR提取文字教程                                   │  │   │
│  │  │    • 图片分析构图/光线/色彩                            │  │   │
│  │  │    • 提取关键技巧点                                    │  │   │
│  │  │                                                       │  │   │
│  │  │  视频帖：                                              │  │   │
│  │  │    • 语音转文字（教程讲解）                            │  │   │
│  │  │    • 关键帧提取（效果展示）                            │  │   │
│  │  │    • 步骤时序分析                                      │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                      │                                      │   │
│  │                      ▼                                      │   │
│  │              ┌──────────────┐                               │   │
│  │              │  结构化数据   │                               │   │
│  │              └──────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Layer 3: 知识抽取层（LLM）                                  │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  输入：                                                      │   │
│  │    • 帖子文字内容："咖啡馆拍照，选择靠窗位置..."              │   │
│  │    • 图片分析结果："构图：三分法，光线：侧光，色彩：暖调"      │   │
│  │    • 互动数据：点赞23000，收藏8500，评论456                  │   │
│  │                                                              │   │
│  │  LLM处理：                                                   │   │
│  │    • 提取核心拍照技巧                                        │   │
│  │    • 识别适用场景和条件                                      │   │
│  │    • 生成构图参数                                            │   │
│  │    • 推导滤镜配置                                            │   │
│  │                                                              │   │
│  │  输出：Skill JSON（见上方结构）                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Layer 4: Skill入库层                                        │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ 质量校验  │→ │ 去重合并  │→ │ 向量生成  │→ │ 入库存储  │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │                                                              │   │
│  │  存储位置：                                                   │   │
│  │    • MySQL：Skill JSON文档                                   │   │
│  │    • Milvus：语义向量索引                                    │   │
│  │    • Redis：热门Skill缓存                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Layer 5: 效果验证层                                         │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  新Skill上线：                                               │   │
│  │    • A/B测试：新Skill vs 旧Skill                             │   │
│  │    • 用户反馈：评分、选择率                                  │   │
│  │    • 成功率统计：对准后拍照完成率                             │   │
│  │                                                              │   │
│  │  质量保障：                                                   │   │
│  │    • 低质量Skill自动降权                                     │   │
│  │    • 高质量Skill加权推荐                                     │   │
│  │    • 定期清理无效Skill                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 爬取目标与策略

#### 3.2.1 目标内容类型

| 内容类型 | 爬取策略 | 学习重点 | 优先级 |
|---------|---------|---------|-------|
| **拍照教程帖** | 关键词搜索 | 步骤化技巧、参数设置 | P0 |
| **出片展示帖** | 高赞监控 | 构图分析、色彩风格 | P0 |
| **达人账号** | 关注追踪 | 系列化技巧、风格化拍摄 | P1 |
| **热门话题** | 实时监控 | 时效性场景、流行趋势 | P1 |
| **评论区讨论** | 辅助分析 | 用户痛点、技巧补充 | P2 |

#### 3.2.2 爬取关键词库

```javascript
const CRAWL_KEYWORDS = {
  // 拍照教程类
  tutorials: [
    "拍照技巧", "人像摄影", "构图技巧", "拍照姿势",
    "手机摄影", "拍照教程", "新手拍照", "摄影入门",
    "光线运用", "色彩搭配", "拍照角度", "镜面反射"
  ],
  
  // 场景类
  scenes: [
    "咖啡馆拍照", "街拍姿势", "海边拍照", "花海拍照",
    "餐厅拍照", "博物馆拍照", "图书馆拍照", "公园拍照",
    "夜景拍照", "旅行拍照", "室内拍照", "户外拍照"
  ],
  
  // 风格类
  styles: [
    "日系拍照", "韩系拍照", "复古拍照", "胶片感",
    "清新拍照", "氛围感拍照", "电影感拍照", "高级感"
  ],
  
  // 主体类
  subjects: [
    "人像拍照", "美食拍照", "情侣拍照", "闺蜜拍照",
    "自拍技巧", "全家福", "宠物拍照", "产品拍照"
  ],
  
  // 时效类（动态更新）
  trending: [
    "春日拍照", "樱花拍照", "秋日拍照", "圣诞节拍照",
    "新年拍照", "生日拍照", "毕业季拍照"
  ]
};
```

#### 3.2.3 高质量内容筛选标准

```javascript
const QUALITY_FILTER = {
  // 基础门槛
  min_likes: 1000,        // 最低点赞数
  min_collects: 300,      // 最低收藏数
  min_images: 3,          // 最少图片数（多图教程更有价值）
  
  // 质量评分公式
  quality_score: (post) => {
    const engagement = post.likes * 1 + post.collects * 3 + post.comments * 2;
    const author_weight = Math.log10(post.author_followers + 1) * 0.5;
    const content_richness = post.image_count * 0.1 + (post.has_video ? 0.3 : 0);
    
    return engagement * (1 + author_weight) * (1 + content_richness);
  },
  
  // 入库阈值
  min_quality_score: 5000
};
```

### 3.3 AI知识抽取流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                    单个帖子的知识抽取流程                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  输入：小红书帖子                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  标题：「咖啡馆拍照｜窗边光线绝了！附构图技巧」                  │   │
│  │  图片：[img1.jpg, img2.jpg, img3.jpg, img4.jpg]              │   │
│  │  文字：「选择靠窗位置，侧身45度面向窗户...」                    │   │
│  │  数据：点赞23000，收藏8500，评论456                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 1: 图片分析（CV模型）                                   │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  对每张图片进行：                                             │   │
│  │    • 构图检测：三分法 / 中心构图 / 对称构图 / 引导线           │   │
│  │    • 光线分析：侧光 / 逆光 / 柔光 / 硬光                       │   │
│  │    • 色彩提取：主色调、色温、饱和度                            │   │
│  │    • 主体位置：人物在画面中的坐标                              │   │
│  │    • 背景分析：简约 / 复杂 / 虚化                              │   │
│  │                                                              │   │
│  │  输出：                                                       │   │
│  │  {                                                           │   │
│  │    "composition": "rule_of_thirds",                          │   │
│  │    "subject_position": { "x": 0.35, "y": 0.4 },              │   │
│  │    "lighting": "side_soft",                                  │   │
│  │    "color_temp": "warm",                                     │   │
│  │    "background": "minimal",                                  │   │
│  │    "aspect_ratio": "3:4"                                     │   │
│  │  }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 2: 文字解析（NLP）                                      │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  处理：                                                       │   │
│  │    • OCR识别：图片中的文字（如有）                             │   │
│  │    • 关键词提取：拍照相关的动作、技巧词                        │   │
│  │    • 步骤识别：将教程文字拆解为步骤                            │   │
│  │    • 场景识别：判断适用的场景                                  │   │
│  │                                                              │   │
│  │  输出：                                                       │   │
│  │  {                                                           │   │
│  │    "keywords": ["靠窗", "侧身", "45度", "自然光"],             │   │
│  │    "steps": [                                                │   │
│  │      "选择靠窗位置",                                          │   │
│  │      "侧身45度面向窗户",                                       │   │
│  │      "手拿咖啡杯增加生活感",                                   │   │
│  │      "相机与人眼平齐"                                          │   │
│  │    ],                                                        │   │
│  │    "scene": "cafe",                                          │   │
│  │    "subject": "person"                                       │   │
│  │  }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 3: 知识融合（LLM）                                      │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  Prompt模板：                                                 │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ 你是一个摄影技巧分析专家。请根据以下信息，                │  │   │
│  │  │ 提取结构化的拍照技能参数：                                │  │   │
│  │  │                                                        │  │   │
│  │  │ 【帖子内容】                                            │  │   │
│  │  │ 标题：{title}                                          │  │   │
│  │  │ 文字：{text}                                           │  │   │
│  │  │                                                        │  │   │
│  │  │ 【图片分析】                                            │  │   │
│  │  │ {image_analysis}                                       │  │   │
│  │  │                                                        │  │   │
│  │  │ 请输出JSON格式的技能参数，包含：                         │  │   │
│  │  │ 1. skill_name: 技能名称                                │  │   │
│  │  │ 2. trigger_conditions: 触发条件                         │  │   │
│  │  │ 3. knowledge: 核心知识点                               │  │   │
│  │  │ 4. execution: 执行参数                                 │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  LLM输出：完整的Skill JSON                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 4: 质量校验                                            │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │                                                              │   │
│  │  检查项：                                                     │   │
│  │    ✓ 必填字段完整性                                           │   │
│  │    ✓ 参数值合理性（圆环位置0-1范围）                           │   │
│  │    ✓ 与已有Skill去重（相似度<0.85）                            │   │
│  │    ✓ 场景标签有效性                                           │   │
│  │                                                              │   │
│  │  通过 → 入库                                                  │   │
│  │  不通过 → 标记问题，人工审核                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 视频内容处理

```
┌─────────────────────────────────────────────────────────────────────┐
│                    视频帖子处理流程                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  输入：视频帖子（60秒教学视频）                                       │
│                                                                     │
│  Step 1: 关键帧提取                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 每5秒提取一帧（共12帧）                                    │   │
│  │  • 场景变化检测，提取关键场景帧                                │   │
│  │  • 效果对比帧（前后对比）                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  Step 2: 语音转文字                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • 使用Whisper API转写语音                                    │   │
│  │  • 识别时间戳，对应视频片段                                    │   │
│  │  • 提取关键教学语句                                            │   │
│  │                                                              │   │
│  │  输出示例：                                                   │   │
│  │  [0:00-0:05] "大家好，今天教大家咖啡馆怎么拍照"                │   │
│  │  [0:05-0:15] "第一步，找一面白墙或者窗户"                      │   │
│  │  [0:15-0:25] "然后侧身45度，面向光线"                          │   │
│  │  [0:25-0:35] "手拿咖啡杯，更自然"                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  Step 3: 图文时序对齐                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  将语音内容与对应帧图片匹配：                                  │   │
│  │                                                              │   │
│  │  Step 1: "找窗户" → 帧画面：窗户场景                          │   │
│  │  Step 2: "侧身45度" → 帧画面：人物侧身姿势                     │   │
│  │  Step 3: "拿咖啡" → 帧画面：手持道具                          │   │
│  │                                                              │   │
│  │  形成完整的步骤化教学数据                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  Step 4: Skill生成                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  基于视频教学内容，生成：                                      │   │
│  │    • 主Skill：整体构图技巧                                    │   │
│  │    • 子Skill：每个步骤的细化指引                               │   │
│  │    • 参考图片：关键帧作为示例                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 自动化任务调度

```javascript
/**
 * 小红书内容爬取调度器
 * 定时任务：每日凌晨2点执行
 */
const cron = require('node-cron');

class XiaohongshuCrawlerScheduler {
  
  constructor() {
    this.crawler = new XiaohongshuCrawler();
    this.parser = new ContentParser();
    this.skillGenerator = new SkillGenerator();
    this.skillDB = new SkillDatabase();
  }
  
  /**
   * 启动定时任务
   */
  start() {
    // 每日爬取任务：凌晨2点
    cron.schedule('0 2 * * *', async () => {
      await this.dailyCrawl();
    });
    
    // 热点追踪：每4小时
    cron.schedule('0 */4 * * *', async () => {
      await this.trendingCrawl();
    });
    
    // 数据清理：每周日凌晨3点
    cron.schedule('0 3 * * 0', async () => {
      await this.weeklyCleanup();
    });
  }
  
  /**
   * 每日爬取主任务
   */
  async dailyCrawl() {
    console.log('[每日爬取] 开始执行...');
    
    try {
      // 1. 关键词搜索爬取
      const keywordPosts = await this.crawler.searchByKeywords(
        Object.values(CRAWL_KEYWORDS).flat()
      );
      
      // 2. 高赞帖子监控
      const hotPosts = await this.crawler.getHotPosts({
        minLikes: 5000,
        timeRange: '24h'
      });
      
      // 3. 关注达人新帖
      const creatorPosts = await this.crawler.getFollowingCreatorsPosts();
      
      // 4. 合并去重
      const allPosts = this.deduplicate([
        ...keywordPosts,
        ...hotPosts,
        ...creatorPosts
      ]);
      
      console.log(`[每日爬取] 共获取 ${allPosts.length} 篇帖子`);
      
      // 5. 内容解析
      let newSkills = 0;
      for (const post of allPosts) {
        try {
          // 解析内容
          const parsed = await this.parser.parse(post);
          
          // 生成Skill
          const skill = await this.skillGenerator.generate(parsed);
          
          // 质量校验
          if (this.validateSkill(skill)) {
            await this.skillDB.insert(skill);
            newSkills++;
          }
        } catch (error) {
          console.error(`[解析失败] post_id: ${post.id}`, error);
        }
      }
      
      console.log(`[每日爬取] 完成，新增 ${newSkills} 个Skill`);
      
      // 6. 发送报告
      await this.sendReport({
        crawled: allPosts.length,
        newSkills,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('[每日爬取] 执行失败:', error);
      await this.sendAlert(error);
    }
  }
  
  /**
   * 热点追踪任务
   */
  async trendingCrawl() {
    console.log('[热点追踪] 开始执行...');
    
    // 获取当前热门话题
    const trendingTopics = await this.crawler.getTrendingTopics();
    
    for (const topic of trendingTopics) {
      const posts = await this.crawler.getPostsByTopic(topic, { limit: 20 });
      
      for (const post of posts) {
        if (post.likes > 10000) {
          const parsed = await this.parser.parse(post);
          const skill = await this.skillGenerator.generate(parsed);
          await this.skillDB.insert(skill);
        }
      }
    }
    
    console.log('[热点追踪] 完成');
  }
  
  /**
   * 每周清理任务
   */
  async weeklyCleanup() {
    console.log('[每周清理] 开始执行...');
    
    // 1. 清理低质量Skill
    await this.skillDB.deleteLowQuality({
      minUsage: 10,
      minSuccessRate: 0.5,
      olderThan: '30d'
    });
    
    // 2. 更新Skill权重
    await this.skillDB.updateWeights();
    
    // 3. 重建向量索引
    await this.skillDB.rebuildVectorIndex();
    
    console.log('[每周清理] 完成');
  }
  
  /**
   * Skill质量校验
   */
  validateSkill(skill) {
    // 必填字段检查
    const requiredFields = [
      'skill_id', 'skill_name', 'skill_type',
      'trigger_conditions', 'execution'
    ];
    
    for (const field of requiredFields) {
      if (!skill[field]) {
        console.warn(`[校验失败] 缺少必填字段: ${field}`);
        return false;
      }
    }
    
    // 参数范围检查
    const { ring_position } = skill.execution.composition_params;
    if (ring_position.x < 0 || ring_position.x > 1 ||
        ring_position.y < 0 || ring_position.y > 1) {
      console.warn('[校验失败] 圆环位置参数超出范围');
      return false;
    }
    
    // 去重检查
    const similarSkills = this.skillDB.findSimilar(skill, { threshold: 0.85 });
    if (similarSkills.length > 0) {
      console.warn(`[校验失败] 与已有Skill相似度过高: ${similarSkills[0].skill_id}`);
      return false;
    }
    
    return true;
  }
}

// 启动调度器
const scheduler = new XiaohongshuCrawlerScheduler();
scheduler.start();
```

---

## 四、数据库设计

### 4.1 核心表结构

```sql
-- ============================================
-- 1. Skill主表
-- ============================================
CREATE TABLE photo_skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  skill_id VARCHAR(50) UNIQUE NOT NULL COMMENT '技能ID: skill_scene_cafe_portrait_001',
  skill_name VARCHAR(100) NOT NULL COMMENT '技能名称',
  skill_type ENUM('composition', 'pose', 'lighting', 'scene', 'filter', 'food') NOT NULL,
  version VARCHAR(20) DEFAULT 'v1.0.0',
  
  -- 完整JSON
  skill_json JSON NOT NULL COMMENT '完整Skill定义',
  
  -- 索引字段（从JSON提取）
  scene_tags JSON COMMENT '场景标签 ["cafe", "indoor"]',
  subject_type JSON COMMENT '主体类型 ["person"]',
  
  -- 来源信息
  source_platform VARCHAR(20) DEFAULT 'xiaohongshu',
  source_post_id VARCHAR(50) COMMENT '小红书帖子ID',
  source_url VARCHAR(500),
  source_author VARCHAR(100),
  source_likes INT DEFAULT 0,
  source_collects INT DEFAULT 0,
  
  -- 统计数据
  usage_count INT DEFAULT 0 COMMENT '调用次数',
  success_count INT DEFAULT 0 COMMENT '成功次数',
  success_rate DECIMAL(3,2) DEFAULT 0 COMMENT '成功率',
  avg_rating DECIMAL(2,1) COMMENT '平均评分',
  
  -- 状态
  status ENUM('active', 'inactive', 'testing') DEFAULT 'testing',
  quality_score DECIMAL(10,2) DEFAULT 0 COMMENT '质量评分',
  
  -- 时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  learned_at DATETIME COMMENT '从小红书学习的时间',
  
  INDEX idx_type (skill_type),
  INDEX idx_status (status),
  INDEX idx_usage (usage_count),
  INDEX idx_quality (quality_score),
  INDEX idx_source (source_post_id)
);


-- ============================================
-- 2. 小红书爬取记录表
-- ============================================
CREATE TABLE xiaohongshu_crawl_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id VARCHAR(50) NOT NULL COMMENT '帖子ID',
  post_url VARCHAR(500),
  crawl_type ENUM('keyword', 'hot', 'creator', 'trending') NOT NULL,
  
  -- 帖子信息
  title VARCHAR(500),
  author VARCHAR(100),
  likes INT DEFAULT 0,
  collects INT DEFAULT 0,
  comments INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  -- 处理状态
  parse_status ENUM('pending', 'processing', 'success', 'failed') DEFAULT 'pending',
  skill_id VARCHAR(50) COMMENT '生成的Skill ID',
  error_message TEXT,
  
  -- 时间
  crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  parsed_at DATETIME,
  
  UNIQUE INDEX idx_post (post_id),
  INDEX idx_status (parse_status)
);


-- ============================================
-- 3. Skill使用日志表
-- ============================================
CREATE TABLE skill_usage_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  skill_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50),
  session_id VARCHAR(100),
  
  -- 使用场景
  detected_scene JSON COMMENT 'AI识别的场景',
  matched_score DECIMAL(3,2) COMMENT '匹配分数',
  
  -- 执行结果
  is_aligned BOOLEAN COMMENT '是否对准成功',
  is_photo_taken BOOLEAN COMMENT '是否拍照',
  photo_saved BOOLEAN COMMENT '是否保存',
  photo_shared BOOLEAN COMMENT '是否分享',
  
  -- 用户反馈
  user_rating TINYINT COMMENT '用户评分1-5',
  user_feedback TEXT COMMENT '用户反馈',
  
  -- 时间
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_skill (skill_id),
  INDEX idx_user (user_id),
  INDEX idx_time (used_at)
);


-- ============================================
-- 4. 滤镜参数表
-- ============================================
CREATE TABLE filter_presets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  filter_id VARCHAR(50) UNIQUE NOT NULL,
  filter_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) COMMENT '分类: warm/cool/vintage/cinematic',
  
  -- 滤镜参数
  params JSON NOT NULL COMMENT '完整滤镜参数',
  
  -- 来源
  source_skill_id VARCHAR(50) COMMENT '关联的Skill',
  source_post_id VARCHAR(50) COMMENT '来源小红书帖子',
  
  -- 统计
  usage_count INT DEFAULT 0,
  avg_rating DECIMAL(2,1),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_category (category)
);


-- ============================================
-- 5. 用户反馈表
-- ============================================
CREATE TABLE user_feedbacks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50),
  skill_id VARCHAR(50),
  
  feedback_type ENUM('rating', 'report', 'suggestion') NOT NULL,
  rating TINYINT COMMENT '评分1-5',
  content TEXT COMMENT '反馈内容',
  
  -- 关联的拍照记录
  session_id VARCHAR(100),
  photo_url VARCHAR(500),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_skill (skill_id),
  INDEX idx_type (feedback_type)
);
```

### 4.2 向量数据库配置

```python
# Milvus Collection配置
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType

# Skill向量集合
skill_collection_schema = CollectionSchema(
    fields=[
        FieldSchema(name="skill_id", dtype=DataType.VARCHAR, max_length=50, is_primary=True),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
        FieldSchema(name="skill_type", dtype=DataType.VARCHAR, max_length=30),
        FieldSchema(name="scene_tags", dtype=DataType.ARRAY, element_type=DataType.VARCHAR, max_length=50, max_capacity=20),
        FieldSchema(name="quality_score", dtype=DataType.FLOAT),
    ],
    description="拍照技能向量索引"
)

# 创建索引
skill_collection = Collection("photo_skills", schema=skill_collection_schema)
skill_collection.create_index(
    field_name="embedding",
    index_params={
        "metric_type": "COSINE",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 1024}
    }
)
```

---

## 五、API接口设计

### 5.1 核心接口列表

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| Skill匹配 | POST | /api/skill/match | 根据场景匹配最佳Skill |
| 帧分析 | POST | /api/vision/analyze | AI分析实时帧 |
| 拍照完成 | POST | /api/photo/complete | 记录拍照结果 |
| 用户反馈 | POST | /api/feedback/submit | 提交用户反馈 |
| Skill列表 | GET | /api/skill/list | 获取Skill列表（管理用） |
| 爬取状态 | GET | /api/crawl/status | 获取爬取任务状态 |

### 5.2 接口详细设计

#### 5.2.1 Skill匹配接口

```yaml
# POST /api/skill/match
Request:
  {
    "scene_tags": ["cafe", "indoor"],
    "subject_type": "person",
    "lighting": "soft",
    "color_tone": "warm",
    "user_preferences": {
      "favorite_style": "natural",
      "exclude_skills": ["skill_id_1"]
    }
  }

Response:
  {
    "code": 0,
    "message": "success",
    "data": {
      "matched_skill": {
        "skill_id": "skill_scene_cafe_portrait_001",
        "skill_name": "咖啡馆窗边人像构图",
        "score": 0.94,
        "source": {
          "author": "摄影师小王",
          "likes": 23000
        }
      },
      "execution": {
        "ring_position": { "x": 0.4, "y": 0.45, "radius": 0.12 },
        "grid_type": "rule_of_thirds",
        "filter": {
          "filter_id": "filter_cafe_warm_01",
          "filter_name": "咖啡馆暖调"
        },
        "camera_settings": {
          "zoom": 1.5,
          "aspect_ratio": "3:4"
        }
      },
      "guidance": {
        "voice_text": "请移动到窗边，利用自然光线",
        "pose_suggestions": ["手拿咖啡杯", "侧身45度"]
      },
      "alternatives": [
        {
          "skill_id": "skill_rule_of_thirds_001",
          "score": 0.85
        }
      ]
    }
  }
```

#### 5.2.2 帧分析接口

```yaml
# POST /api/vision/analyze
Request:
  {
    "image": "base64_encoded_image_data",
    "skill_id": "skill_scene_cafe_portrait_001",
    "screen_size": {
      "width": 375,
      "height": 667
    }
  }

Response:
  {
    "code": 0,
    "message": "success",
    "data": {
      "detection": {
        "subject": {
          "type": "person",
          "confidence": 0.95,
          "bounding_box": {
            "x1": 120, "y1": 80,
            "x2": 360, "y2": 520
          },
          "center": { "x": 240, "y": 300 }
        },
        "scene": {
          "tags": ["cafe", "indoor"],
          "confidence": 0.92
        }
      },
      "alignment": {
        "target_position": { "x": 150, "y": 300 },  # 目标圆环位置
        "current_position": { "x": 240, "y": 300 }, # 当前主体位置
        "offset": { "dx": 90, "dy": 0 },            # 偏移量
        "distance": 90,
        "is_aligned": false,
        "progress": 35
      },
      "guidance": {
        "direction": "left",
        "voice_text": "请向左移动，对准窗边光位",
        "arrow_angle": 180
      }
    }
  }
```

#### 5.2.3 爬取状态接口

```yaml
# GET /api/crawl/status
Response:
  {
    "code": 0,
    "data": {
      "last_crawl": "2025-01-20T02:00:00Z",
      "next_crawl": "2025-01-21T02:00:00Z",
      "statistics": {
        "total_posts_crawled": 125678,
        "total_skills_generated": 3456,
        "active_skills": 2890,
        "avg_quality_score": 0.82
      },
      "recent_jobs": [
        {
          "date": "2025-01-20",
          "posts_crawled": 1234,
          "skills_generated": 45,
          "status": "completed"
        },
        {
          "date": "2025-01-19",
          "posts_crawled": 1189,
          "skills_generated": 38,
          "status": "completed"
        }
      ],
      "queue_status": {
        "pending": 56,
        "processing": 12,
        "failed": 3
      }
    }
  }
```

---

## 六、开发计划

### 6.1 里程碑规划（更新版）

```
┌─────────────────────────────────────────────────────────────────────┐
│                       开发里程碑（v2.0）                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  M1: 基础版本 (Week 1-2)                                            │
│  ├── ✅ 相机模块开发                                                │
│  ├── ✅ 彩色圆环UI实现                                              │
│  ├── ✅ 基础拍照功能                                                │
│  └── ✅ 手动构图模式                                                │
│                                                                     │
│  M2: Skill系统 (Week 3-5) 🔥 NEW                                    │
│  ├── ✅ Skill数据结构定义                                           │
│  ├── ✅ Skill数据库搭建                                             │
│  ├── ✅ 向量索引服务                                                │
│  ├── ✅ Skill匹配引擎开发                                           │
│  ├── ✅ 初始Skill库构建（手动录入50个）                              │
│  └── ✅ Skill执行流程集成                                           │
│                                                                     │
│  M3: 小红书学习引擎 (Week 6-8) 🔥 NEW                                │
│  ├── ✅ 爬虫服务开发                                                │
│  ├── ✅ 内容解析模块                                                │
│  ├── ✅ LLM知识抽取                                                 │
│  ├── ✅ 自动化任务调度                                              │
│  ├── ✅ Skill自动生成入库                                           │
│  └── ✅ 质量校验系统                                                │
│                                                                     │
│  M4: AI视觉集成 (Week 9-10)                                         │
│  ├── ✅ AI Vision服务接入                                           │
│  ├── ✅ 实时帧分析                                                  │
│  ├── ✅ 场景识别                                                    │
│  └── ✅ 指引生成优化                                                │
│                                                                     │
│  M5: 滤镜与优化 (Week 11-12)                                        │
│  ├── ✅ 滤镜系统开发                                                │
│  ├── ✅ 滤镜自动推荐                                                │
│  ├── ✅ 性能优化                                                    │
│  └── ✅ UI/UX打磨                                                   │
│                                                                     │
│  M6: 上线与运营 (Week 13-14)                                        │
│  ├── ✅ 测试与Bug修复                                               │
│  ├── ✅ 提交审核                                                    │
│  ├── ✅ 正式上线                                                    │
│  └── ✅ 持续学习引擎启动                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 详细任务拆解

#### Phase 2: Skill系统开发（Week 3-5）

| 任务ID | 任务名称 | 工时 | 负责人 | 产出物 |
|-------|---------|------|-------|-------|
| T2.1 | Skill JSON Schema设计 | 8h | 架构师 | Schema文档 |
| T2.2 | MySQL表结构设计与建表 | 4h | 后端 | SQL脚本 |
| T2.3 | Milvus向量库部署 | 8h | 后端 | 向量服务 |
| T2.4 | Skill CRUD API开发 | 12h | 后端 | API接口 |
| T2.5 | Skill匹配引擎开发 | 16h | 后端 | 匹配服务 |
| T2.6 | 初始Skill录入（50个） | 16h | 运营 | Skill数据 |
| T2.7 | 前端Skill调用集成 | 12h | 前端 | 小程序代码 |

#### Phase 3: 小红书学习引擎（Week 6-8）

| 任务ID | 任务名称 | 工时 | 负责人 | 产出物 |
|-------|---------|------|-------|-------|
| T3.1 | 小红书爬虫服务开发 | 24h | 后端 | 爬虫服务 |
| T3.2 | 反爬策略与代理池 | 16h | 后端 | 代理服务 |
| T3.3 | 图片分析模块（CV） | 16h | AI | CV服务 |
| T3.4 | 文字解析模块（NLP） | 12h | AI | NLP服务 |
| T3.5 | LLM知识抽取Prompt设计 | 8h | AI | Prompt库 |
| T3.6 | Skill自动生成流水线 | 16h | 后端 | 生成服务 |
| T3.7 | 自动化调度系统 | 8h | 后端 | 调度服务 |
| T3.8 | 质量校验系统 | 8h | 后端 | 校验服务 |

---

## 七、风险与合规

### 7.1 小红书爬取合规风险

| 风险项 | 风险描述 | 应对方案 |
|-------|---------|---------|
| **版权风险** | 爬取内容可能涉及版权 | 仅提取技巧参数，不直接使用图片/文字 |
| **服务条款** | 可能违反小红书ToS | 使用官方API（如有），控制爬取频率 |
| **反爬机制** | IP被封禁 | 代理池轮换，模拟真实用户行为 |
| **数据安全** | 爬取数据存储安全 | 数据加密存储，访问权限控制 |

### 7.2 技术风险

| 风险项 | 风险描述 | 应对方案 |
|-------|---------|---------|
| LLM成本高 | 大量帖子解析成本高 | 批量处理，使用低成本模型 |
| Skill质量参差 | 自动生成的Skill质量不稳定 | 人工审核+用户反馈双重校验 |
| 向量检索延迟 | 实时匹配可能有延迟 | 缓存热门Skill，优化索引 |

---

## 八、数据监控与运营

### 8.1 核心指标

| 指标类型 | 指标名称 | 目标值 | 监控频率 |
|---------|---------|-------|---------|
| **Skill质量** | Skill总数 | >3000 | 每日 |
| | Skill成功率 | >75% | 每日 |
| | Skill平均评分 | >4.0 | 每周 |
| **学习引擎** | 日爬取帖子数 | >500 | 每日 |
| | 日新增Skill数 | >10 | 每日 |
| | Skill入库成功率 | >60% | 每日 |
| **用户体验** | 对准成功率 | >80% | 每日 |
| | 滤镜使用率 | >50% | 每周 |
| | 用户推荐率 | >70% | 每周 |

### 8.2 监控看板

```
┌─────────────────────────────────────────────────────────────────────┐
│                        运营监控看板                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Skill知识库统计                                             │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  总数: 3,456  |  活跃: 2,890  |  测试中: 456  |  废弃: 110   │   │
│  │                                                              │   │
│  │  按类型分布:                                                  │   │
│  │  构图: 1,200 | 姿势: 800 | 场景: 900 | 其他: 556              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  学习引擎状态                                                 │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  今日爬取: 1,234帖  |  新增Skill: 45  |  成功率: 82%          │   │
│  │  处理队列: 56帖    |  失败: 3帖    |  平均质量分: 0.85         │   │
│  │                                                              │   │
│  │  最近热门来源:                                                 │   │
│  │  1. 「咖啡馆拍照技巧」- 点赞23k                                │   │
│  │  2. 「街拍姿势合集」- 点赞18k                                  │   │
│  │  3. 「美食俯拍教程」- 点赞15k                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  用户使用反馈                                                 │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  今日拍照: 12,345次  |  成功率: 87%  |  平均评分: 4.3/5        │   │
│  │                                                              │   │
│  │  热门Skill Top 5:                                              │   │
│  │  1. 咖啡馆窗边人像 (使用3,456次, 成功率92%)                    │   │
│  │  2. 三分法人像构图 (使用2,890次, 成功率89%)                    │   │
│  │  3. 街拍动态姿势 (使用2,345次, 成功率85%)                      │   │
│  │  4. 美食俯拍构图 (使用1,987次, 成功率91%)                      │   │
│  │  5. 逆光人像技巧 (使用1,654次, 成功率88%)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 九、附录

### 9.1 Skill完整示例（街拍动态）

```json
{
  "skill_id": "skill_street_walking_001",
  "skill_name": "街拍走路动态感",
  "skill_type": "pose",
  "version": "v1.1.0",
  
  "source": {
    "platform": "xiaohongshu",
    "post_id": "65b2c3d4e5f6g7",
    "post_url": "https://www.xiaohongshu.com/explore/65b2c3d4e5f6g7",
    "author": "街拍达人Lisa",
    "author_followers": 890000,
    "likes": 45000,
    "collects": 12000,
    "learned_at": "2025-01-18T14:00:00Z"
  },
  
  "trigger_conditions": {
    "scene_tags": ["street", "outdoor", "urban", "road"],
    "subject_type": ["person"],
    "lighting_condition": ["bright", "golden_hour", "overcast"],
    "required_confidence": 0.75
  },
  
  "knowledge": {
    "summary": "捕捉走路瞬间，营造自然随性的街拍感。小红书街拍爆款技巧，强调动态与氛围感。",
    "principles": [
      "不要看镜头，自然行走",
      "步伐轻盈，手部自然摆动",
      "可在画面中留出动线空间",
      "连拍抓取最佳瞬间",
      "低角度拍摄更有气场"
    ],
    "key_learnings": [
      "不看镜头比看镜头更自然",
      "低角度显腿长",
      "连拍是成功的关键",
      "背影也有氛围感"
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": { "x": 0.5, "y": 0.5, "radius": 0.18 },
      "grid_type": "center",
      "guide_lines": []
    },
    "pose_guide": {
      "head_tilt": "straight",
      "body_angle": 0,
      "hand_placement": ["自然摆动", "拿手机", "插兜", "拿咖啡"],
      "gaze_direction": "away_right",
      "walking": true,
      "walking_speed": "slow"
    },
    "camera_settings": {
      "zoom": 1,
      "aspect_ratio": "3:4",
      "height_suggestion": "low_angle",
      "burst_mode": true
    },
    "filter_recommendation": {
      "filter_id": "filter_street_cool_01",
      "filter_name": "街拍冷调",
      "params": {
        "temperature": 5200,
        "tint": -5,
        "contrast": 1.15,
        "saturation": 0.9,
        "grain": 0.15
      },
      "confidence": 0.85
    }
  },
  
  "guidance": {
    "voice_templates": [
      { "condition": "准备", "text": "请自然走向镜头，不要看相机" },
      { "condition": "动作僵硬", "text": "放松肩膀，步伐轻一点" },
      { "condition": "速度太快", "text": "走得慢一点，更好抓拍" },
      { "condition": "已对准", "text": "保持自然行走，连续拍摄中" }
    ],
    "success_message": "✅ 完美！正在连拍，保持走动",
    "tips": "不看镜头更自然哦"
  },
  
  "analytics": {
    "usage_count": 8765,
    "success_rate": 0.85,
    "avg_user_rating": 4.5
  }
}
```

### 9.2 滤镜参数示例

```json
{
  "filter_id": "filter_cafe_warm_01",
  "filter_name": "咖啡馆暖调",
  "category": "warm",
  
  "params": {
    "base": {
      "brightness": 1.05,
      "contrast": 1.1,
      "saturation": 0.95,
      "exposure": 0.1
    },
    "color": {
      "temperature": 6200,
      "tint": 15,
      "vibrance": 0.1
    },
    "tone": {
      "highlights": -0.1,
      "shadows": 0.15,
      "whites": 0.05,
      "blacks": -0.05
    },
    "effects": {
      "vignette": 0.2,
      "grain": 0.08,
      "fade": 0.05
    },
    "split_toning": {
      "highlights": { "h": 35, "s": 15 },
      "shadows": { "h": 220, "s": 10 },
      "balance": 50
    },
    "curves": {
      "rgb": [[0,5], [64,60], [128,130], [192,195], [255,250]],
      "red": [[0,0], [128,125], [255,255]],
      "green": [[0,0], [128,128], [255,255]],
      "blue": [[0,10], [128,125], [255,245]]
    }
  },
  
  "source": {
    "learned_from": "skill_scene_cafe_portrait_001",
    "reference_post": "小红书「咖啡馆拍照」高赞帖子"
  }
}
```

---

## 文档修订记录

| 版本 | 日期 | 修订人 | 修订内容 |
|-----|------|-------|---------|
| v1.0.0 | 2025-01 | AI | 初稿完成 |
| v2.0.0 | 2025-01 | AI | 新增Skill系统、小红书持续学习引擎 |

---

**文档结束**

> 本PRD v2.0新增核心能力：
> 1. **智能Skill系统** - 结构化拍照技巧，AI可读可执行
> 2. **小红书持续学习引擎** - 每日自动爬取、解析、入库
> 3. **自我进化能力** - 知识库持续更新，越用越聪明
