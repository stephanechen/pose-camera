# 拍照技能（Photo Skill）结构化设计方案

---

## 一、Skill整体架构

### 1.1 设计理念

```
┌─────────────────────────────────────────────────────────────────┐
│                    拍照Skill = 知识 + 规则 + 执行                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   知识层（Knowledge）     规则层（Rules）      执行层（Executor）  │
│   ┌─────────────┐      ┌─────────────┐     ┌─────────────┐    │
│   │ 小红书摄影教程 │      │ 场景匹配规则 │     │ 构图参数输出 │    │
│   │ 人像技巧知识库 │  +   │ 指引生成逻辑 │  →  │ 滤镜推荐    │    │
│   │ 构图案例数据  │      │ 评分权重配置 │     │ 动作指令    │    │
│   └─────────────┘      └─────────────┘     └─────────────┘    │
│                                                                 │
│   载体：JSON Schema + Markdown + 代码函数                        │
│   存储：向量数据库 + 结构化数据库 + 代码仓库                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 AI可调用方案对比

| 方案 | 可读性 | 可执行性 | 可维护性 | 推荐度 |
|-----|-------|---------|---------|-------|
| **JSON Schema** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Markdown文档 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 代码函数 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 知识图谱 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **混合方案** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**推荐：JSON Schema + 向量知识库 + 代码执行的混合方案**

---

## 二、Skill核心结构设计

### 2.1 Skill元数据定义（JSON Schema）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PhotoSkill",
  "description": "拍照技能结构化定义，AI可读取并执行",
  "type": "object",
  "properties": {
    "skill_id": {
      "type": "string",
      "description": "技能唯一标识",
      "pattern": "^skill_[a-z_]+_[0-9]{3}$"
    },
    "skill_name": {
      "type": "string",
      "description": "技能名称（人类可读）"
    },
    "skill_type": {
      "type": "string",
      "enum": ["composition", "pose", "lighting", "angle", "filter", "scene"],
      "description": "技能类型"
    },
    "version": {
      "type": "string",
      "pattern": "^v[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "source": {
      "type": "object",
      "description": "知识来源",
      "properties": {
        "platform": { "type": "string", "enum": ["xiaohongshu", "douyin", "tutorial", "expert"] },
        "reference_url": { "type": "string", "format": "uri" },
        "author": { "type": "string" },
        "learned_at": { "type": "string", "format": "date-time" }
      }
    },
    "trigger_conditions": {
      "type": "object",
      "description": "触发条件（AI判断是否调用此技能）",
      "properties": {
        "scene_tags": {
          "type": "array",
          "items": { "type": "string" },
          "description": "场景标签，如['indoor', 'cafe', 'portrait']"
        },
        "subject_type": {
          "type": "array",
          "items": { "type": "string", "enum": ["person", "group", "food", "product", "landscape", "pet"] },
          "description": "主体类型"
        },
        "lighting_condition": {
          "type": "array",
          "items": { "type": "string", "enum": ["bright", "soft", "backlight", "golden_hour", "night"] }
        },
        "required_confidence": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "default": 0.7,
          "description": "AI识别置信度阈值"
        }
      }
    },
    "knowledge": {
      "type": "object",
      "description": "核心知识内容（供AI理解）",
      "properties": {
        "summary": {
          "type": "string",
          "description": "技能简要描述（100字内）"
        },
        "principles": {
          "type": "array",
          "items": { "type": "string" },
          "description": "核心原则，如['三分法构图', '留白', '引导线']"
        },
        "steps": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "step_id": { "type": "integer" },
              "action": { "type": "string" },
              "purpose": { "type": "string" }
            }
          },
          "description": "执行步骤"
        },
        "examples": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "image_url": { "type": "string" },
              "description": { "type": "string" },
              "tags": { "type": "array", "items": { "type": "string" } }
            }
          },
          "description": "示例图片和说明"
        }
      }
    },
    "execution": {
      "type": "object",
      "description": "执行参数（AI输出给前端）",
      "properties": {
        "composition_params": {
          "type": "object",
          "properties": {
            "ring_position": {
              "type": "object",
              "properties": {
                "x": { "type": "number", "description": "圆环中心X（相对位置0-1）" },
                "y": { "type": "number", "description": "圆环中心Y（相对位置0-1）" },
                "radius": { "type": "number", "description": "圆环半径（相对值）" }
              }
            },
            "grid_type": {
              "type": "string",
              "enum": ["none", "rule_of_thirds", "golden_ratio", "golden_spiral", "center", "symmetry"]
            },
            "guide_lines": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": { "type": "string", "enum": ["horizontal", "vertical", "diagonal"] },
                  "position": { "type": "number" }
                }
              }
            }
          }
        },
        "pose_guide": {
          "type": "object",
          "properties": {
            "head_tilt": { "type": "string", "enum": ["straight", "left", "right", "up", "down"] },
            "body_angle": { "type": "number", "description": "身体角度（度）" },
            "hand_placement": { "type": "array", "items": { "type": "string" } },
            "gaze_direction": { "type": "string", "enum": ["camera", "away_left", "away_right", "down"] }
          }
        },
        "camera_settings": {
          "type": "object",
          "properties": {
            "zoom": { "type": "number", "minimum": 0.5, "maximum": 3 },
            "aspect_ratio": { "type": "string", "enum": ["3:4", "1:1", "16:9", "4:3"] },
            "height_suggestion": { "type": "string", "enum": ["eye_level", "low_angle", "high_angle", "bird_eye"] }
          }
        },
        "filter_recommendation": {
          "type": "object",
          "properties": {
            "filter_id": { "type": "string" },
            "filter_name": { "type": "string" },
            "confidence": { "type": "number" },
            "alternative_filters": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        }
      }
    },
    "guidance": {
      "type": "object",
      "description": "用户指引生成配置",
      "properties": {
        "voice_templates": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "condition": { "type": "string", "description": "触发条件描述" },
              "text": { "type": "string", "description": "语音文案" }
            }
          }
        },
        "arrow_direction": {
          "type": "object",
          "properties": {
            "align_x": { "type": "string", "enum": ["left", "right", "center"] },
            "align_y": { "type": "string", "enum": ["up", "down", "center"] }
          }
        },
        "success_message": { "type": "string" }
      }
    },
    "quality_score": {
      "type": "object",
      "description": "质量评分权重",
      "properties": {
        "composition_weight": { "type": "number", "default": 0.4 },
        "lighting_weight": { "type": "number", "default": 0.3 },
        "subject_clarity_weight": { "type": "number", "default": 0.2 },
        "overall_aesthetics_weight": { "type": "number", "default": 0.1 }
      }
    },
    "embedding_vector": {
      "type": "array",
      "items": { "type": "number" },
      "description": "技能语义向量（用于相似度检索）"
    }
  },
  "required": ["skill_id", "skill_name", "skill_type", "trigger_conditions", "knowledge", "execution"]
}
```

### 2.2 完整Skill示例（小红书人像摄影技巧）

```json
{
  "skill_id": "skill_portrait_rule_of_thirds_001",
  "skill_name": "三分法人像构图",
  "skill_type": "composition",
  "version": "v1.0.0",
  
  "source": {
    "platform": "xiaohongshu",
    "reference_url": "https://www.xiaohongshu.com/explore/xxxxx",
    "author": "摄影师小王",
    "learned_at": "2025-01-15T10:00:00Z"
  },
  
  "trigger_conditions": {
    "scene_tags": ["portrait", "outdoor", "indoor", "cafe", "street"],
    "subject_type": ["person"],
    "lighting_condition": ["bright", "soft", "golden_hour"],
    "required_confidence": 0.7
  },
  
  "knowledge": {
    "summary": "将人物放在画面三分线交叉点附近，创造自然、平衡的构图效果，是小红书最受欢迎的人像构图技巧之一。",
    
    "principles": [
      "主体置于三分线交叉点",
      "视线前方留出更多空间",
      "避免人物居中呆板感",
      "利用环境线条引导视线"
    ],
    
    "steps": [
      {
        "step_id": 1,
        "action": "识别画面中的人物主体",
        "purpose": "确定构图主体位置"
      },
      {
        "step_id": 2,
        "action": "计算人物中心点与三分线交叉点的距离",
        "purpose": "判断当前构图偏离程度"
      },
      {
        "step_id": 3,
        "action": "生成移动指引，将人物引导至最近的三分点",
        "purpose": "优化构图平衡感"
      },
      {
        "step_id": 4,
        "action": "检测人物朝向，确保视线前方有空间",
        "purpose": "避免画面压迫感"
      }
    ],
    
    "examples": [
      {
        "image_url": "https://cdn.example.com/skills/example1.jpg",
        "description": "人物位于右侧三分线，面向左侧，前方留白自然",
        "tags": ["portrait", "outdoor", "golden_hour", "rule_of_thirds"]
      }
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": {
        "x": 0.67,
        "y": 0.4,
        "radius": 0.15
      },
      "grid_type": "rule_of_thirds",
      "guide_lines": [
        { "type": "vertical", "position": 0.333 },
        { "type": "vertical", "position": 0.667 },
        { "type": "horizontal", "position": 0.333 },
        { "type": "horizontal", "position": 0.667 }
      ]
    },
    
    "pose_guide": {
      "head_tilt": "slight_right",
      "body_angle": 15,
      "hand_placement": ["自然下垂", "托腮", "插兜"],
      "gaze_direction": "away_left"
    },
    
    "camera_settings": {
      "zoom": 2,
      "aspect_ratio": "3:4",
      "height_suggestion": "eye_level"
    },
    
    "filter_recommendation": {
      "filter_id": "filter_warm_portrait_01",
      "filter_name": "暖调人像",
      "confidence": 0.85,
      "alternative_filters": ["filter_fresh_01", "filter_cinematic_02"]
    }
  },
  
  "guidance": {
    "voice_templates": [
      {
        "condition": "人物偏左",
        "text": "请将人物向右移动，对准右侧圆环"
      },
      {
        "condition": "人物偏右",
        "text": "请将人物向左移动"
      },
      {
        "condition": "人物偏上",
        "text": "请稍微下蹲，让人物在画面中位置下移"
      },
      {
        "condition": "已对准",
        "text": "完美！人物已位于最佳构图位置，可以拍摄"
      }
    ],
    
    "arrow_direction": {
      "align_x": "right",
      "align_y": "center"
    },
    
    "success_message": "✅ 三分法构图达标！"
  },
  
  "quality_score": {
    "composition_weight": 0.4,
    "lighting_weight": 0.3,
    "subject_clarity_weight": 0.2,
    "overall_aesthetics_weight": 0.1
  },
  
  "embedding_vector": [0.123, 0.456, 0.789, "..."]
}
```

---

## 三、Skill知识库构建

### 3.1 小红书摄影知识采集流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    小红书摄影知识采集流程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: 内容采集                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • 关键词搜索：「人像构图」「拍照技巧」「出片教程」           │   │
│  │ • 高赞笔记筛选（点赞>1000）                               │   │
│  │ • 提取：图文内容 + 标签 + 评论互动                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                    │
│  Step 2: 知识抽取（AI辅助）                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • LLM解析：提取核心技巧、步骤、参数                        │   │
│  │ • 结构化：转换为Skill JSON格式                            │   │
│  │ • 标注：场景标签、主体类型、适用条件                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                    │
│  Step 3: 向量化存储                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Embedding：生成技能语义向量                              │   │
│  │ • 存储：存入向量数据库（Milvus/Pinecone）                  │   │
│  │ • 索引：建立场景、类型、标签多维索引                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                    │
│  Step 4: 验证与优化                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • A/B测试：对比不同Skill的出片效果                         │   │
│  │ • 用户反馈：收集用户评分和选择                             │   │
│  │ • 迭代优化：调整参数、补充知识                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Skill分类体系

```
┌─────────────────────────────────────────────────────────────────┐
│                      拍照Skill分类树                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  skill_root                                                     │
│  ├── composition（构图类）                                       │
│  │   ├── skill_rule_of_thirds（三分法）                         │
│  │   ├── skill_center_composition（中心构图）                   │
│  │   ├── skill_golden_ratio（黄金分割）                         │
│  │   ├── skill_symmetry（对称构图）                             │
│  │   ├── skill_leading_lines（引导线构图）                      │
│  │   ├── skill_frame_within_frame（框架构图）                   │
│  │   └── skill_negative_space（留白构图）                       │
│  │                                                              │
│  ├── pose（姿势类）                                              │
│  │   ├── skill_portrait_pose_standing（站姿）                   │
│  │   ├── skill_portrait_pose_sitting（坐姿）                    │
│  │   ├── skill_portrait_pose_walking（走姿）                    │
│  │   └── skill_couple_pose（情侣姿势）                          │
│  │                                                              │
│  ├── scene（场景类）                                             │
│  │   ├── skill_scene_cafe（咖啡馆）                             │
│  │   ├── skill_scene_street（街拍）                             │
│  │   ├── skill_scene_beach（海边）                              │
│  │   ├── skill_scene_forest（森林）                             │
│  │   └── skill_scene_restaurant（餐厅）                         │
│  │                                                              │
│  ├── lighting（光线类）                                          │
│  │   ├── skill_golden_hour（黄金时刻）                          │
│  │   ├── skill_backlight（逆光）                                │
│  │   ├── skill_window_light（窗边光）                           │
│  │   └── skill_night_scene（夜景）                              │
│  │                                                              │
│  └── filter（滤镜类）                                            │
│      ├── skill_filter_warm（暖调）                              │
│      ├── skill_filter_cool（冷调）                              │
│      ├── skill_filter_vintage（复古）                           │
│      └── skill_filter_cinematic（电影感）                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 小红书典型Skill示例集

#### Skill 1: 咖啡馆人像

```json
{
  "skill_id": "skill_scene_cafe_portrait_001",
  "skill_name": "咖啡馆窗边人像",
  "skill_type": "scene",
  
  "trigger_conditions": {
    "scene_tags": ["cafe", "indoor", "window", "coffee"],
    "subject_type": ["person"],
    "lighting_condition": ["soft", "bright"]
  },
  
  "knowledge": {
    "summary": "利用咖啡馆窗边柔和自然光，配合简约背景，拍出文艺清新人像。小红书咖啡馆打卡最常用技巧。",
    "principles": [
      "选择靠窗位置，利用柔和侧光",
      "背景选择简约墙面或书架",
      "人物侧身45度面向窗户",
      "手拿咖啡杯增加生活感"
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": { "x": 0.4, "y": 0.45, "radius": 0.12 },
      "grid_type": "rule_of_thirds"
    },
    "pose_guide": {
      "head_tilt": "slight_left",
      "body_angle": 45,
      "hand_placement": ["拿咖啡杯", "翻书", "托腮"],
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
      "confidence": 0.9
    }
  },
  
  "guidance": {
    "voice_templates": [
      { "condition": "光线不足", "text": "请移动到窗边，利用自然光线" },
      { "condition": "背景杂乱", "text": "请调整角度，避开背后杂物" },
      { "condition": "已对准", "text": "完美！窗边光线很棒，可以拍摄" }
    ]
  }
}
```

#### Skill 2: 街拍动态感

```json
{
  "skill_id": "skill_street_dynamic_001",
  "skill_name": "街拍动态走路姿势",
  "skill_type": "pose",
  
  "trigger_conditions": {
    "scene_tags": ["street", "outdoor", "urban"],
    "subject_type": ["person"],
    "lighting_condition": ["bright", "golden_hour"]
  },
  
  "knowledge": {
    "summary": "捕捉走路瞬间，营造自然随性的街拍感。小红书街拍爆款技巧，强调动态与氛围感。",
    "principles": [
      "不要看镜头，自然行走",
      "步伐轻盈，手部自然摆动",
      "可在画面中留出动线空间",
      "连拍抓取最佳瞬间"
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": { "x": 0.5, "y": 0.5, "radius": 0.18 },
      "grid_type": "center"
    },
    "pose_guide": {
      "head_tilt": "straight",
      "body_angle": 0,
      "hand_placement": ["自然摆动", "拿手机", "插兜"],
      "gaze_direction": "away_right"
    },
    "camera_settings": {
      "zoom": 1,
      "aspect_ratio": "3:4",
      "height_suggestion": "low_angle"
    },
    "filter_recommendation": {
      "filter_id": "filter_street_cool_01",
      "filter_name": "街拍冷调",
      "confidence": 0.8
    }
  },
  
  "guidance": {
    "voice_templates": [
      { "condition": "准备", "text": "请自然走向镜头，不要看相机" },
      { "condition": "动作僵硬", "text": "放松肩膀，步伐轻一点" },
      { "condition": "已对准", "text": "保持自然行走，连续拍摄中" }
    ]
  }
}
```

#### Skill 3: 美食俯拍

```json
{
  "skill_id": "skill_food_topdown_001",
  "skill_name": "美食俯拍构图",
  "skill_type": "composition",
  
  "trigger_conditions": {
    "scene_tags": ["food", "restaurant", "dining"],
    "subject_type": ["food"],
    "lighting_condition": ["bright", "soft"]
  },
  
  "knowledge": {
    "summary": "45度俯拍角度，将美食置于画面中心或三分点，配合餐具和手部出镜，小红书美食博主标配。",
    "principles": [
      "手机与桌面呈45度角",
      "美食占据画面中心",
      "手拿餐具增加生活感",
      "背景干净或虚化处理"
    ]
  },
  
  "execution": {
    "composition_params": {
      "ring_position": { "x": 0.5, "y": 0.5, "radius": 0.22 },
      "grid_type": "center"
    },
    "pose_guide": {
      "hand_placement": ["拿叉子", "拿筷子", "拿杯子"]
    },
    "camera_settings": {
      "zoom": 1.5,
      "aspect_ratio": "1:1",
      "height_suggestion": "high_angle"
    },
    "filter_recommendation": {
      "filter_id": "filter_food_bright_01",
      "filter_name": "美食明亮",
      "confidence": 0.95
    }
  },
  
  "guidance": {
    "voice_templates": [
      { "condition": "角度不对", "text": "请将手机抬高，俯拍美食" },
      { "condition": "手未入镜", "text": "可以拿叉子或杯子入镜" },
      { "condition": "已对准", "text": "构图很棒，可以拍摄" }
    ]
  }
}
```

---

## 四、AI调用Skill的完整流程

### 4.1 实时调用架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI调用Skill实时流程                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户打开相机                                                        │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 1: 场景识别（AI Vision）                               │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  输入：实时帧数据                                             │   │
│  │  处理：                                                      │   │
│  │    • 物体检测 → 识别主体类型（person/food/product...）         │   │
│  │    • 场景分类 → 识别场景标签（cafe/street/indoor...）          │   │
│  │    • 光线分析 → 判断光线条件（bright/soft/backlight...）       │   │
│  │  输出：                                                      │   │
│  │    {                                                         │   │
│  │      "scene_tags": ["cafe", "indoor"],                       │   │
│  │      "subject_type": "person",                               │   │
│  │      "lighting": "soft",                                     │   │
│  │      "confidence": 0.85                                      │   │
│  │    }                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 2: Skill检索（向量数据库）                              │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  输入：场景标签 + 主体类型 + 光线条件                          │   │
│  │  处理：                                                      │   │
│  │    • 构建查询向量                                            │   │
│  │    • 向量相似度搜索（Top-K）                                  │   │
│  │    • 规则过滤（trigger_conditions匹配）                       │   │
│  │  输出：匹配的Skill列表                                        │   │
│  │    [                                                         │   │
│  │      { skill_id: "skill_scene_cafe_portrait_001", score: 0.92 },│  │
│  │      { skill_id: "skill_rule_of_thirds_001", score: 0.85 },   │   │
│  │      { skill_id: "skill_window_light_001", score: 0.78 }      │   │
│  │    ]                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 3: Skill执行（参数输出）                                │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  输入：最佳匹配的Skill                                        │   │
│  │  处理：                                                      │   │
│  │    • 读取execution参数                                       │   │
│  │    • 计算当前主体位置与目标位置偏移                            │   │
│  │    • 生成指引指令                                             │   │
│  │  输出：                                                      │   │
│  │    {                                                         │   │
│  │      "ring_position": { x: 0.4, y: 0.45, radius: 0.12 },     │   │
│  │      "current_subject_pos": { x: 0.35, y: 0.5 },             │   │
│  │      "offset": { dx: -0.05, dy: 0.05 },                      │   │
│  │      "guidance": {                                           │   │
│  │        "direction": "right",                                 │   │
│  │        "voice_text": "请向右移动，对准窗边光位",               │   │
│  │        "arrow_angle": 45                                     │   │
│  │      },                                                      │   │
│  │      "filter": "filter_cafe_warm_01",                        │   │
│  │      "success_threshold": 0.1                                │   │
│  │    }                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Step 4: UI渲染（前端执行）                                   │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  • 更新圆环位置                                              │   │
│  │  • 显示方向箭头                                              │   │
│  │  • 播放语音提示                                              │   │
│  │  • 预览滤镜效果                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  用户对准 → 拍照 → 应用滤镜 → 保存/分享                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 代码实现

```javascript
/**
 * Skill调用引擎
 * 负责实时场景识别 → Skill匹配 → 执行参数输出
 */
class PhotoSkillEngine {
  
  constructor() {
    this.vectorDB = new MilvusClient();  // 向量数据库
    this.aiVision = new AIVisionService(); // AI视觉服务
    this.skillCache = new Map();          // Skill缓存
  }
  
  /**
   * 主入口：实时帧分析
   * @param {string} frameBase64 - 帧数据Base64
   * @returns {Object} 指引参数
   */
  async analyzeFrame(frameBase64) {
    // Step 1: 场景识别
    const sceneContext = await this.aiVision.analyzeScene(frameBase64);
    
    // Step 2: Skill检索
    const matchedSkills = await this.matchSkills(sceneContext);
    
    // 如果没有匹配的Skill，使用默认
    const bestSkill = matchedSkills[0] || this.getDefaultSkill();
    
    // Step 3: 计算对准参数
    const executionParams = await this.executeSkill(
      bestSkill, 
      sceneContext
    );
    
    return executionParams;
  }
  
  /**
   * Step 1: AI场景识别
   */
  async analyzeScene(frameBase64) {
    const result = await this.aiVision.detect(frameBase64, {
      features: ['object_detection', 'scene_classification', 'lighting_analysis']
    });
    
    return {
      sceneTags: result.scene.tags,           // ['cafe', 'indoor']
      subjectType: result.objects[0]?.type,   // 'person'
      subjectBox: result.objects[0]?.box,     // {x1, y1, x2, y2}
      lighting: result.lighting.condition,    // 'soft'
      confidence: result.objects[0]?.confidence
    };
  }
  
  /**
   * Step 2: Skill匹配（向量检索 + 规则过滤）
   */
  async matchSkills(sceneContext) {
    // 2.1 构建查询向量
    const queryText = `${sceneContext.sceneTags.join(' ')} ${sceneContext.subjectType} ${sceneContext.lighting}`;
    const queryVector = await this.getEmbedding(queryText);
    
    // 2.2 向量相似度搜索
    const searchResult = await this.vectorDB.search({
      collection: 'photo_skills',
      vector: queryVector,
      top_k: 5
    });
    
    // 2.3 规则过滤（trigger_conditions匹配）
    const matchedSkills = searchResult
      .filter(item => this.matchTriggerConditions(item.skill, sceneContext))
      .sort((a, b) => b.score - a.score);
    
    return matchedSkills.map(item => item.skill);
  }
  
  /**
   * 规则匹配：判断Skill是否适用于当前场景
   */
  matchTriggerConditions(skill, sceneContext) {
    const conditions = skill.trigger_conditions;
    
    // 检查场景标签匹配
    const sceneMatch = conditions.scene_tags.some(tag => 
      sceneContext.sceneTags.includes(tag)
    );
    
    // 检查主体类型匹配
    const subjectMatch = conditions.subject_type.includes(sceneContext.subjectType);
    
    // 检查光线条件匹配
    const lightingMatch = conditions.lighting_condition.includes(sceneContext.lighting);
    
    // 检查置信度阈值
    const confidenceMatch = sceneContext.confidence >= conditions.required_confidence;
    
    return sceneMatch && subjectMatch && lightingMatch && confidenceMatch;
  }
  
  /**
   * Step 3: 执行Skill，输出指引参数
   */
  async executeSkill(skill, sceneContext) {
    const { execution, guidance } = skill;
    const { subjectBox } = sceneContext;
    
    // 计算当前主体中心
    const subjectCenter = {
      x: (subjectBox.x1 + subjectBox.x2) / 2,
      y: (subjectBox.y1 + subjectBox.y2) / 2
    };
    
    // 目标位置（圆环中心）
    const targetPosition = execution.composition_params.ring_position;
    
    // 计算偏移量（归一化到屏幕坐标）
    const screenWidth = 375;  // 示例值
    const screenHeight = 667; // 示例值
    
    const offset = {
      dx: targetPosition.x * screenWidth - subjectCenter.x,
      dy: targetPosition.y * screenHeight - subjectCenter.y
    };
    
    // 判断是否对准
    const distance = Math.sqrt(offset.dx * offset.dx + offset.dy * offset.dy);
    const threshold = targetPosition.radius * screenWidth * 0.5;
    const isAligned = distance <= threshold;
    
    // 生成指引
    let guidanceOutput;
    if (isAligned) {
      guidanceOutput = {
        direction: null,
        voice_text: guidance.success_message,
        arrow_angle: null,
        progress: 100
      };
    } else {
      guidanceOutput = this.generateGuidance(offset, guidance);
    }
    
    return {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      
      // 圆环参数
      ring_position: targetPosition,
      grid_type: execution.composition_params.grid_type,
      
      // 对准状态
      is_aligned: isAligned,
      offset: offset,
      distance: distance,
      progress: Math.max(0, 100 - (distance / threshold) * 100),
      
      // 用户指引
      guidance: guidanceOutput,
      
      // 滤镜推荐
      filter: execution.filter_recommendation,
      
      // 相机设置建议
      camera_settings: execution.camera_settings,
      
      // 姿势建议
      pose_guide: execution.pose_guide
    };
  }
  
  /**
   * 生成用户指引
   */
  generateGuidance(offset, guidanceConfig) {
    const angle = Math.atan2(offset.dy, offset.dx) * 180 / Math.PI;
    const distance = Math.sqrt(offset.dx * offset.dx + offset.dy * offset.dy);
    
    // 确定方向
    let direction, voiceText;
    
    if (Math.abs(offset.dx) > Math.abs(offset.dy)) {
      // 主要水平偏移
      direction = offset.dx > 0 ? 'right' : 'left';
      voiceText = offset.dx > 0 ? '请向右移动' : '请向左移动';
    } else {
      // 主要垂直偏移
      direction = offset.dy > 0 ? 'down' : 'up';
      voiceText = offset.dy > 0 ? '请向下移动' : '请向上移动';
    }
    
    // 从模板中选择最合适的语音文案
    const template = guidanceConfig.voice_templates.find(t => 
      t.condition.includes(direction)
    );
    
    return {
      direction,
      voice_text: template?.text || voiceText,
      arrow_angle: angle,
      progress: 0
    };
  }
  
  /**
   * 获取文本向量
   */
  async getEmbedding(text) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  /**
   * 默认Skill（无匹配时使用）
   */
  getDefaultSkill() {
    return {
      skill_id: 'skill_default_center_001',
      skill_name: '中心构图（默认）',
      trigger_conditions: {},
      knowledge: { summary: '将主体置于画面中央' },
      execution: {
        composition_params: {
          ring_position: { x: 0.5, y: 0.5, radius: 0.15 },
          grid_type: 'center'
        },
        filter_recommendation: {
          filter_id: 'filter_auto',
          filter_name: '智能优化'
        }
      },
      guidance: {
        voice_templates: [
          { condition: '偏左', text: '请向右移动' },
          { condition: '偏右', text: '请向左移动' }
        ],
        success_message: '✅ 已对准，可以拍摄'
      }
    };
  }
}

// 导出单例
module.exports = new PhotoSkillEngine();
```

### 4.3 前端调用示例

```javascript
// 小程序端调用
const skillEngine = require('../../services/skill-engine');

Page({
  data: {
    ringPosition: { x: 0.5, y: 0.5, radius: 0.15 },
    guidanceText: '请对准彩色圆环',
    isAligned: false,
    filterPreview: null
  },
  
  // 相机帧回调
  async onFrame(e) {
    const { width, height, data } = e.detail;
    
    // 节流：200ms处理一次
    if (this.lastFrameTime && Date.now() - this.lastFrameTime < 200) {
      return;
    }
    this.lastFrameTime = Date.now();
    
    // 转Base64
    const base64 = wx.arrayBufferToBase64(data);
    
    // 调用Skill引擎
    try {
      const result = await skillEngine.analyzeFrame(base64);
      
      // 更新UI
      this.setData({
        ringPosition: result.ring_position,
        guidanceText: result.guidance.voice_text,
        isAligned: result.is_aligned,
        progress: result.progress,
        filterPreview: result.filter
      });
      
      // 对准成功时震动反馈
      if (result.is_aligned && !this.lastAligned) {
        wx.vibrateShort({ type: 'medium' });
      }
      this.lastAligned = result.is_aligned;
      
    } catch (error) {
      console.error('Skill执行失败:', error);
    }
  },
  
  // 拍照
  async takePhoto() {
    if (!this.data.isAligned) {
      wx.showToast({ title: '请先对准圆环', icon: 'none' });
      return;
    }
    
    const ctx = wx.createCameraContext();
    const res = await ctx.takePhoto({ quality: 'high' });
    
    // 应用滤镜
    const filteredPath = await this.applyFilter(
      res.tempImagePath, 
      this.data.filterPreview.filter_id
    );
    
    // 保存并预览
    wx.saveImageToPhotosAlbum({
      filePath: filteredPath,
      success: () => {
        wx.showToast({ title: '保存成功' });
      }
    });
  }
});
```

---

## 五、Skill知识库存储方案

### 5.1 混合存储架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill知识库存储架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  向量数据库（Milvus / Pinecone）                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  存储：Skill语义向量（embedding_vector）                  │   │
│  │  用途：相似度检索、场景匹配                               │   │
│  │  索引：IVF_FLAT / HNSW                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  结构化数据库（MySQL / MongoDB）                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  存储：Skill完整JSON文档                                 │   │
│  │  用途：快速读取、更新、删除                               │   │
│  │  索引：skill_id, skill_type, scene_tags                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  对象存储（OSS / COS）                                   │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  存储：示例图片、语音文件                                │   │
│  │  用途：Skill内容展示、语音播报                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  缓存层（Redis）                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  存储：热门Skill、用户常用Skill                          │   │
│  │  用途：加速访问、减轻数据库压力                           │   │
│  │  TTL：1小时                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 数据库表设计

```sql
-- MySQL表结构
CREATE TABLE photo_skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  skill_id VARCHAR(50) UNIQUE NOT NULL COMMENT '技能ID',
  skill_name VARCHAR(100) NOT NULL COMMENT '技能名称',
  skill_type ENUM('composition', 'pose', 'lighting', 'angle', 'filter', 'scene') NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  
  -- 完整JSON文档
  skill_json JSON NOT NULL COMMENT '完整Skill定义',
  
  -- 索引字段（从JSON提取，便于查询）
  scene_tags JSON COMMENT '场景标签数组',
  subject_type JSON COMMENT '主体类型数组',
  
  -- 元数据
  source_platform VARCHAR(20) COMMENT '来源平台',
  source_url VARCHAR(500) COMMENT '来源链接',
  author VARCHAR(100) COMMENT '原作者',
  
  -- 统计
  usage_count INT DEFAULT 0 COMMENT '调用次数',
  success_rate DECIMAL(3,2) COMMENT '成功率',
  avg_rating DECIMAL(2,1) COMMENT '用户评分',
  
  -- 时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (skill_type),
  INDEX idx_platform (source_platform),
  INDEX idx_usage (usage_count)
);

-- 向量表（Milvus Collection定义）
-- collection: photo_skills
-- 字段:
--   - skill_id: VARCHAR (主键)
--   - embedding: FLOAT_VECTOR(1536) (向量维度)
--   - skill_type: VARCHAR
--   - scene_tags: ARRAY<VARCHAR>
```

---

## 六、总结

### 6.1 Skill呈现方式对比

| 方案 | 适用场景 | AI可读性 | 推荐度 |
|-----|---------|---------|-------|
| **JSON Schema** | 参数传递、执行指令 | ⭐⭐⭐⭐⭐ | 核心 |
| **Markdown文档** | 知识说明、人工查阅 | ⭐⭐⭐⭐ | 辅助 |
| **向量嵌入** | 语义检索、相似匹配 | ⭐⭐⭐⭐⭐ | 核心 |
| **代码函数** | 执行逻辑、算法封装 | ⭐⭐⭐⭐ | 核心 |

### 6.2 最佳实践建议

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill构建最佳实践                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 结构化优先：用JSON Schema定义核心参数，AI直接解析执行         │
│                                                                 │
│  2. 语义化存储：为每个Skill生成向量，支持相似场景检索             │
│                                                                 │
│  3. 规则与向量结合：先用向量召回Top-K，再用规则精确过滤           │
│                                                                 │
│  4. 持续学习：收集用户反馈数据，优化Skill参数                    │
│                                                                 │
│  5. 版本管理：Skill支持版本迭代，A/B测试新版本效果                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**文档结束**

> 本方案定义了拍照Skill的完整结构化方案，AI可以：
> 1. **读取**：解析JSON Schema获取参数
> 2. **检索**：通过向量相似度匹配场景
> 3. **执行**：输出构图参数、滤镜推荐、用户指引
> 4. **优化**：基于用户反馈迭代Skill权重
