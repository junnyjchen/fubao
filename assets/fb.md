## 符宝网（fubao.ltd）网站规划方案

### 一、网站定位
**全球玄门文化科普交易平台**  
以「科普先行、交易放心」为核心逻辑，打造符箓法器领域的内容+交易闭环生态。

---

### 二、网站架构

#### **1. 首页（导航+核心入口）**
- **顶部导航栏**
  - 符宝百科（科普）
  - 宝品商城（交易）
  - 玄门动态（新闻活动）
  - 视频学堂
  - 个人中心

- **首屏Banner**
  - 轮播展示：每日符箓科普/热门法器/全球玄门活动

- **核心功能区**
  - 快速入口：一物一证查询｜认证机构名录｜担保交易说明
  - 搜索框：支持按符箓名称、用途（镇宅/祈福/修炼）、宫观检索

- **内容推荐区**
  - 今日符箓：每日推荐一道符，图文详解
  - 热门法器：展示平台热销/上新宝品
  - 玄门头条：全球符箓相关新闻动态

---

#### **2. 符宝百科（科普核心）**

**栏目结构**
| 一级栏目 | 二级栏目 | 内容形式 |
|---------|---------|---------|
| 符箓入门 | 什么是符箓｜符箓的起源｜符箓的分类 | 图文+短视频 |
| 符箓图鉴 | 镇宅符｜招财符｜平安符｜学业符｜姻缘符 | 高清图+功效详解+使用说明 |
| 法器图鉴 | 桃木剑｜八卦镜｜铜钱剑｜葫芦｜罗盘 | 高清图+材质+使用场景 |
| 玄门常识 | 开光是什么｜如何请符｜符箓的保存方法 | 科普长文+问答 |
| 道观寺庙 | 知名宫观介绍｜法脉传承｜参观指南 | 图文+VR全景（规划） |

**特色功能**
- 每日一符：首页+百科同步更新，支持分享
- 符箓功效索引：按求财、健康、事业等标签筛选
- 用户投稿：邀请道长/修行者撰写科普内容

---

#### **3. 宝品商城（交易核心）**

**商品分类**
- 按用途：镇宅化煞｜招财旺运｜健康平安｜学业功名｜姻缘和合
- 按类型：符箓｜法器｜供品｜修行用品
- 按宫观：武当山｜青城山｜龙虎山｜少林寺｜大昭寺等

**商品详情页核心模块**
- 高清图集（多角度展示）
- 一物一证入口：点击查看平台出具的检验证明/开光证书
- 卖家信息：认证机构名称+资质标识
- 担保交易标识
- 灵力说明（如适用）：符箓功效描述+有效期
- 用户评价：仅展示已购买用户评价
- 相关科普推荐：关联百科文章

**交易流程**
1. 用户浏览/搜索商品
2. 查看商品详情+认证信息
3. 下单支付（平台担保）
4. 卖家发货
5. 用户确认收货
6. 评价

**拍卖/寄卖专区**
- 珍品拍卖：定期举办符箓法器专场拍卖
- 个人寄卖：用户可申请寄卖，平台审核后上架

---

#### **4. 玄门动态（新闻活动）**

**内容类型**
| 类型 | 内容示例 | 更新频率 |
|-----|---------|---------|
| 全球新闻 | 某道观举办罗天大醮｜某寺庙发现古符 | 每日 |
| 行业资讯 | 宗教政策解读｜非遗保护动态 | 每周 |
| 平台活动 | 符箓文化节｜开光法器预售 | 按需 |
| 用户互动 | 有奖征集｜线上祈福活动 | 每月 |

**展现形式**
- 图文资讯（主）
- 短视频报道（规划）
- 活动日历：展示近期全球玄门活动时间线

---

#### **5. 视频学堂**

**栏目规划**
- 道长说符：3-5分钟短视频，道长讲解符箓文化
- 法器开箱：开光法器展示+使用教学
- 宫观巡礼：探访知名道观寺庙
- 直播回放：开光仪式/法会现场

**技术需求**
- 支持H5播放器
- 视频打点评论（在特定时间点讨论）
- 相关商品推荐（视频下方关联法器购买）

---

#### **6. 个人中心**

**功能模块**
- 我的订单：交易记录/物流查询
- 我的收藏：收藏的百科文章/商品
- 我的证书：购买的符箓法器认证证书存档
- 消息通知：订单状态/活动提醒
- 实名认证：用于寄卖/拍卖功能
- 道箓积分：信用体系展示

---

### 三、H5自适应设计要点

| 端 | 设计要点 |
|---|---------|
| **移动端（优先）** | 单列布局，底部Tab导航，图片自适应，按钮大小适配手指点击 |
| **PC端** | 多栏布局，顶部横向导航，商品/内容可网格展示 |
| **共用原则** | 同一套HTML/CSS，通过媒体查询适配不同屏幕宽度 |

---

### 四、技术栈建议

| 层面 | 推荐方案 |
|-----|---------|
| 前端 | Vue3 + Vant UI（移动端组件库） + 响应式CSS |
| 后端 | Node.js / Java SpringBoot |
| 数据库 | MySQL + Redis |
| 支付 | 微信支付+支付宝（企业资质） |
| 视频 | 阿里云/腾讯云点播服务 |
| 图片 | OSS存储+CDN加速 |
| 搜索 | Elasticsearch（商品+内容检索） |

---

### 五、内容运营启动建议

**上线前储备**
- 百科文章：30-50篇基础科普
- 视频：10-15条短视频
- 商品：与认证机构签约上架50-100件
- 新闻：同步采集全球玄门资讯

**每日更新机制**
- 每日一道符（图文）
- 每日一条玄门新闻
- 每周一条视频
- 每月一场活动

---

### 六、SEO优化建议

- 百科栏目采用静态化页面，利于搜索引擎收录
- 商品详情页设置独立TDK（标题/描述/关键词）
- 图文内容嵌入「符箓」「法器」「开光」等核心关键词
- 搭建网站地图sitemap.xml

---

### 七、域名使用规划

```
主站：www.fubao.ltd
百科：bk.fubao.ltd 或 /baike
商城：shop.fubao.ltd 或 /shop
视频：video.fubao.ltd 或 /video
```

---

如需进一步细化某一模块（如商城交易流程、百科内容分类、视频栏目规划等），可继续补充说明。


## 符宝网（fubao.ltd）网站规划方案 v2.0

### 一、网站定位
**全球玄门文化科普交易平台 | 多商户生态**  
以「科普先行、交易放心」为核心逻辑，打造符箓法器领域的内容+多商户交易闭环生态，支持多语言全球服务。

---

### 二、多语言策略

#### **1. 默认语言：繁体中文**
- 覆盖港澳台、海外华人群体
- 所有内容优先以繁体中文呈现

#### **2. 多语言支持（首期）**
| 语言 | 适用地区 | 优先级 |
|-----|---------|-------|
| 繁体中文 | 港澳台、海外华人 | 默认 |
| 简体中文 | 中国大陆 | 高 |
| 英文 | 全球 | 高 |
| 日文 | 日本 | 中 |
| 韩文 | 韩国 | 中 |

#### **3. 语言切换机制**
- 顶部导航栏语言切换图标
- 记住用户上次选择
- 商品/百科内容支持多语言版本（商家可自行上传多语言商品描述）

---

### 三、网站架构

#### **1. 首页（导航+核心入口）**

**顶部导航栏**
- 符宝百科
- 宝品商城
- 玄门动态
- 视频学堂
- 个人中心
- 语言切换 | 商户入驻入口

**首屏Banner**
- 轮播展示：每日符箓科普/热门法器/全球玄门活动

**核心功能区**
- 快速入口：一物一证查询｜认证机构名录｜担保交易说明｜商户入驻
- 搜索框：支持按符箓名称、用途、宫观、地区检索

**内容推荐区**
- 今日符箓：每日推荐一道符，图文详解
- 热门法器：展示平台热销/上新宝品
- 玄门头条：全球符箓相关新闻动态
- 推荐商户：精选道观/寺庙店铺

---

#### **2. 符宝百科（科普核心）**

**栏目结构**
| 一级栏目 | 二级栏目 | 内容形式 | 多语言支持 |
|---------|---------|---------|-----------|
| 符箓入门 | 什么是符箓｜符箓的起源｜符箓的分类 | 图文+短视频 | 全语言 |
| 符箓图鉴 | 镇宅符｜招财符｜平安符等 | 高清图+功效详解 | 全语言 |
| 法器图鉴 | 桃木剑｜八卦镜｜葫芦等 | 高清图+材质说明 | 全语言 |
| 玄门常识 | 开光｜请符｜符箓保存 | 科普长文 | 全语言 |
| 宫观百科 | 知名道观寺庙介绍｜法脉传承 | 图文+VR全景 | 全语言 |

**特色功能**
- 每日一符：首页+百科同步更新
- 符箓功效索引：按用途标签筛选
- 用户投稿：邀请道长/修行者撰写

---

#### **3. 宝品商城（多商户交易核心）**

##### **3.1 多商户体系**

**商户类型**
| 商户类型 | 说明 | 入驻要求 |
|---------|-----|---------|
| 道观店铺 | 道教宫观官方开店 | 提供宗教活动场所登记证 |
| 寺庙店铺 | 佛教寺庙官方开店 | 提供宗教活动场所登记证 |
| 认证机构 | 非遗传承人/合法法器工坊 | 提供相关资质证明 |

**商户后台功能**
- 商品管理：上架/下架/库存/价格
- 订单管理：查看订单/发货/退款处理
- 认证管理：上传开光证明/检验证书
- 店铺装修：店铺头图/介绍/多语言设置
- 数据看板：销售额/访客数/转化率
- 多语言商品描述：支持上传多语言版本

##### **3.2 商品分类**

**按用途**
- 镇宅化煞｜招财旺运｜健康平安｜学业功名｜姻缘和合

**按类型**
- 符箓｜法器｜供品｜修行用品

**按宫观**
- 武当山｜青城山｜龙虎山｜少林寺｜大昭寺｜其他（按地区分类）

##### **3.3 商品详情页核心模块**
- 高清图集（多角度展示）
- 多语言切换：商品描述自动切换用户所选语言
- 一物一证入口：点击查看平台出具的检验证明/开光证书
- 卖家信息：店铺名称+资质标识+店铺评分+入驻年限
- 担保交易标识
- 灵力说明（如适用）：符箓功效描述+有效期
- 用户评价：仅展示已购买用户评价
- 相关科普推荐：关联百科文章
- 跨境说明：是否支持国际物流

##### **3.4 交易流程**
1. 用户浏览/搜索商品（支持多语言）
2. 进入店铺或商品详情页
3. 查看商品信息+认证信息+店铺评分
4. 下单支付（平台担保，多币种支持）
5. 商户发货（支持国际物流）
6. 用户确认收货
7. 评价（评价内容支持多语言）

##### **3.5 拍卖/寄卖专区**
- 珍品拍卖：定期举办符箓法器专场拍卖
- 商户寄卖：认证商户可申请寄卖高端藏品

---

#### **4. 玄门动态（新闻活动）**

**内容类型**
| 类型 | 内容示例 | 多语言处理 |
|-----|---------|-----------|
| 全球新闻 | 某道观举办罗天大醮 | 人工翻译+机器辅助 |
| 行业资讯 | 宗教政策解读 | 优先翻译 |
| 平台活动 | 符箓文化节｜商户招募 | 全语言同步 |
| 用户互动 | 有奖征集｜线上祈福 | 按活动范围选择语言 |

**展现形式**
- 图文资讯
- 短视频报道
- 活动日历：全球玄门活动时间线，按地区筛选

---

#### **5. 视频学堂**

**栏目规划**
- 道长说符：3-5分钟短视频
- 法器开箱：开光法器展示
- 宫观巡礼：探访知名道观寺庙
- 直播回放：开光仪式/法会现场

**多语言支持**
- 视频字幕：支持多语言字幕切换
- 简介翻译：视频标题/简介多语言版本

---

#### **6. 个人中心**

**功能模块**
- 我的订单：交易记录/物流查询
- 我的收藏：收藏的文章/商品/店铺
- 我的证书：购买的符箓法器认证证书存档
- 消息通知：订单状态/活动提醒/多语言推送
- 实名认证：用于寄卖/拍卖功能
- 语言偏好：设置默认语言

---

### 四、多商户运营机制

#### **1. 商户入驻流程**
```
提交申请 → 资质审核（3-5工作日） → 签署协议 → 店铺开通 → 商品上架
```

#### **2. 平台与商户关系**
| 项目 | 说明 |
|-----|-----|
| 平台角色 | 流量引入、交易担保、认证服务、多语言翻译支持 |
| 商户角色 | 商品供应、发货售后、店铺运营 |
| 收益模式 | 平台收取交易佣金（建议5%-10%）+认证服务费 |
| 结算周期 | T+7（用户确认收货后7天结算） |

#### **3. 商户激励政策**
- 新店扶持：首页推荐位+免佣首月
- 优质店铺：降低佣金比例+流量倾斜
- 文化贡献：提供优质科普内容的商户额外奖励

---

### 五、技术架构建议

| 层面 | 推荐方案 | 多语言考虑 |
|-----|---------|-----------|
| 前端 | Vue3 + Vant UI | i18n国际化插件 |
| 后端 | Java SpringBoot | 多语言内容管理 |
| 数据库 | MySQL | 内容表增加lang字段 |
| 多语言管理 | 自研CMS / 第三方 | 支持商户上传多语言商品描述 |
| 支付 | 微信+支付宝+国际信用卡 | 多币种结算 |
| 视频 | 阿里云/腾讯云点播 | 多语言字幕支持 |
| 翻译 | 人工翻译+机器翻译辅助 | 百科内容优先人工 |

---

### 六、内容运营启动建议

**上线前储备**
- 百科文章：30-50篇（先做繁体中文）
- 视频：10-15条（先做繁体字幕）
- 商户：签约10-20家认证道观/寺庙
- 商品：每商户上架10-20件，总量100-200件

**多语言内容规划**
- 首期上线：繁体中文+简体中文+英文
- 百科内容：先完成核心50篇的英译
- 商品描述：商户自行上传多语言版本，平台提供翻译工具辅助

---

### 七、域名使用规划

```
主站：www.fubao.ltd
百科：bk.fubao.ltd 或 /baike
商城：shop.fubao.ltd 或 /shop
视频：video.fubao.ltd 或 /video
商户后台：merchant.fubao.ltd
```

---

### 八、多语言UI文案示例

| 中文（繁） | English |
|-----------|---------|
| 符寶網 | FuBao |
| 全球玄門修行者信賴的靈性資產交易平臺 | The Trusted Marketplace for Spiritual Practitioners |
| 符寶百科 | FuBao Encyclopedia |
| 寶品商城 | Sacred Treasures |
| 一物一證 | One Item, One Certificate |
| 擔保交易 | Escrow Protected |
| 認證機構 | Certified Institutions |

---

如需进一步细化多商户结算流程、多语言内容管理系统设计、或商户入驻协议模板，可继续补充说明。

根据主流技术，选择最适合快速实现的框架，支付增加paypol支持，并给出页面设计标准规范，下一步要给cozi进行开发

## 符宝网（fubao.ltd）技术架构与开发规范

### 一、技术选型方案（快速实现导向）

基于符宝网「多商户+多语言+科普内容+商城」的核心需求，结合主流技术栈的成熟度与开发效率，推荐以下方案：

#### **方案对比与选型建议**

| 维度 | 推荐方案 | 备选方案 | 选型理由 |
|-----|---------|---------|---------|
| **后端框架** | ThinkPHP 8.0（PHP） | Spree Commerce（Ruby） | PHP生态成熟，多商户商城类系统支持完善，部署简单 |
| **前端框架** | uni-app（Vue2/Vue3） | Next.js + React | 一套代码编译H5/小程序/APP，完美满足H5自适应需求 |
| **数据库** | MySQL 8.0 + Redis | MariaDB | 电商系统成熟方案，支持多语言数据存储 |
| **支付网关** | PayPal + 微信支付 + 支付宝 | Stripe | 国际支付PayPal优先，国内双支付全覆盖 |
| **搜索引擎** | ElasticSearch | MySQL全文索引 | 商品/百科多语言检索性能优化 |

#### **核心选型结论**

**推荐采用：ThinkPHP 8.0 + uni-app + PayPal/微信/支付宝三合一支付**

这套组合的优势：
- **快速开发**：基于成熟商城系统二次开发（如CRMEB/怎快），节省60%以上开发时间
- **多语言原生支持**：uni-app + i18n国际化组件，前台支持数十种语言切换
- **多商户体系完善**：已有成熟的多商户B2B2C模块，支持道观寺庙独立开店
- **PayPal集成成熟**：官方SDK支持，JS SDK一键集成

---

### 二、技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层（uni-app）                      │
├─────────────────────────────────────────────────────────────┤
│  H5端（主推）  │  微信小程序  │  iOS/Android APP（规划）     │
│  多语言切换：繁体中文/简体/英文/日文/韩文                    │
└─────────────────────────────────────────────────────────────┘
                                    ↓ API调用
┌─────────────────────────────────────────────────────────────┐
│                      Nginx（负载均衡/静态资源）               │
└─────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    ThinkPHP 8.0（后端API）                   │
├─────────────────────────────────────────────────────────────┤
│  模块1：用户模块    │  模块4：多商户模块（道观/寺庙店铺）    │
│  模块2：商品模块    │  模块5：认证模块（一物一证）          │
│  模块3：订单模块    │  模块6：科普模块（百科/视频）         │
│  模块7：多语言CMS   │  模块8：新闻活动模块                  │
└─────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│         MySQL 8.0（主库）    │    Redis（缓存/会话）         │
│         ElasticSearch（商品/内容搜索）                      │
└─────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                      第三方服务集成                          │
├─────────────────────────────────────────────────────────────┤
│  PayPal │ 微信支付 │ 支付宝 │ 阿里云OSS（图片/视频）        │
│  腾讯云点播 │ 短信服务 │ 高德地图（宫观定位）              │
└─────────────────────────────────────────────────────────────┘
```

---

### 三、页面设计标准规范

#### **1. 视觉规范（基于2026通用设计标准）**

**颜色系统**

| 类型 | 色值（HEX） | 用途 | 平台差异 |
|-----|------------|------|---------|
| 主色（玄门青） | `#1A5F3C`（深青）→ `#2E8B57`（亮青） | 品牌色、主要按钮、重要标签 | iOS降低饱和度，Android用原色 |
| 辅助色-成功 | `#36D399` | 认证通过、支付成功 | 无差异 |
| 辅助色-警告 | `#F87272` | 错误提示、库存紧张 | 无差异 |
| 中性色-主文字 | `#1D2129` | 标题、正文 | 深色模式切换为`#FFFFFF` |
| 中性色-辅文字 | `#4E5969` | 描述、时间 | 同上 |
| 中性色-边框 | `#E5E6EB` | 分割线、输入框边框 | 同上 |
| 玄门点缀色 | `#C9A87C`（古铜金） | 符箓标签、认证徽章 | 保持统一 |

**字体规范**

| 层级 | 字号（px） | 行高（px） | 字重 | 适用场景 | 英文字体 |
|-----|-----------|-----------|------|---------|---------|
| 大标题 | 24 | 32 | Bold | 百科文章标题 | SF Pro / Roboto |
| 模块标题 | 20 | 28 | Semibold | 首页栏目标题 | SF Pro / Roboto |
| 正文 | 16 | 24 | Regular | 商品描述、文章内容 | SF Pro / Roboto |
| 辅助文字 | 12 | 18 | Regular | 价格标签、时间 | SF Pro / Roboto |

**间距与布局**

- **基准单位**：4px（所有间距为4的倍数）
- **容器边距**：左右16px（手机端），上下12px（模块间距）
- **安全区域**：适配刘海屏/底部指示条（`safe-area-inset-*`变量）

**圆角与阴影**

| 元素 | 圆角 | 阴影 | 备注 |
|-----|------|------|------|
| 按钮 | 8px | `0 2px 8px rgba(0,0,0,0.08)` | 点击态加深透明度 |
| 卡片 | 12px | `0 4px 12px rgba(0,0,0,0.1)` | 商品卡片、文章卡片 |
| 弹窗 | 16px | `0 8px 24px rgba(0,0,0,0.15)` | 模态框 |

#### **2. 组件规范**

**按钮组件**

| 类型 | 尺寸 | 背景色 | 圆角 | 点击反馈 |
|-----|------|-------|------|---------|
| 主按钮（primary） | 高44px，宽自适应 | 主色 | 8px | 透明度80% + scale(0.98) |
| 次要按钮（secondary） | 高40px | 透明+边框 | 8px | 边框加深 |
| 文字按钮（text） | 高32px | 透明 | 4px | 文字颜色加深 |

**商品卡片组件**

- 尺寸：宽度自适应，高度约320px
- 结构：商品图（比例1:1）→ 商品名称（2行截断）→ 价格区（主色大号字体）→ 店铺名称（小字+认证标识）
- 交互：点击跳转商品详情，长按弹出分享菜单

**符箓认证标识组件**

```
┌─────────────────────────┐
│  ⚡ 一物一证 · 平台认证  │  徽章样式
│  检验编号：FB20260001    │  小字说明
└─────────────────────────┘
```

#### **3. 交互规范**

**手势反馈**
- 点击按钮：缩放0.98 + 透明度变化（时长200ms）
- 列表滑动：左滑删除/收藏（触发区44px高）
- 下拉刷新：顶部加载动画（仅内容页）

**动效参数**
- 页面切换：淡入淡出（opacity 0→1，时长250ms）
- 加载状态：骨架屏（Skeleton）→ 内容渐显
- 缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`

#### **4. 多端适配要点**

| 端 | 适配要点 |
|---|---------|
| **移动端H5（主推）** | 750rpx设计稿，视口meta配置，触摸事件优化 |
| **PC端** | 最大宽度1200px，左右留白，导航栏横排 |
| **微信小程序** | 条件编译适配原生组件，分享海报功能 |

---

### 四、PayPal支付集成方案

#### **集成架构**（基于PayPal Complete Platform + 支付网关封装）

```
前端（uni-app）                   后端（ThinkPHP）
     │                                  │
     │ 1. 用户点击PayPal支付             │
     ├─────────────────────────────────>│
     │                                  │ 2. 创建订单，调用prepareCall
     │ 3. 返回orderID                    │
     │<─────────────────────────────────┤
     │                                  │
     │ 4. 渲染PayPal按钮                  │
     │ （payment.js SDK）                │
     │                                  │
     │ 5. 用户在PayPal完成支付            │
     │                                  │
     │ 6. 支付成功回调（completeHandler） │
     ├─────────────────────────────────>│
     │                                  │ 7. 确认支付，更新订单
     │ 8. 返回支付结果                    │
     │<─────────────────────────────────┤
```

#### **前端集成代码示例**（uni-app环境）

```javascript
// 在uni-app页面中集成PayPal
// 1. 加载PayPal JS SDK
const loadPayPalScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=HKD'
    script.onload = resolve
    document.body.appendChild(script)
  })
}

// 2. 渲染PayPal按钮
const renderPayPalButton = (orderId, amount) => {
  paypal.Buttons({
    style: { color: 'gold', shape: 'rect', label: 'pay' },
    createOrder: () => orderId,
    onApprove: async (data) => {
      // 支付成功，调用后端确认接口
      const res = await uni.request({
        url: '/api/payment/paypal/capture',
        method: 'POST',
        data: { orderID: data.orderID }
      })
      if (res.statusCode === 200) {
        uni.showToast({ title: '支付成功', icon: 'success' })
        // 跳转订单详情
      }
    },
    onError: (err) => {
      uni.showToast({ title: '支付失败，请重试', icon: 'none' })
    }
  }).render('#paypal-button-container')
}
```

#### **后端接口设计**（ThinkPHP）

```php
// PayPal支付控制器
namespace app\api\controller\payment;

use think\facade\Db;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;

class PayPal
{
    // 创建订单（pre-create）
    public function createOrder()
    {
        $orderId = $this->generateOrderId();
        // 调用PayPal API创建订单，返回orderID
        return json(['orderID' => $orderId]);
    }
    
    // 捕获支付（支付成功后确认）
    public function captureOrder()
    {
        $orderID = $this->request->post('orderID');
        // 调用PayPal API确认支付
        // 更新本地订单状态
        return json(['success' => true]);
    }
}
```

---

### 五、数据库设计核心表结构

#### **多商户相关表**

| 表名 | 说明 | 关键字段 |
|-----|------|---------|
| `merchant` | 商户（道观/寺庙） | id, name, type（道观/寺庙）, certification_level, contact_info, status |
| `merchant_user` | 商户管理员 | id, merchant_id, username, password, role |
| `note` | 商品表 | id, merchant_id, title, price, stock, is_certified（是否一物一证） |
| `note_sku` | 商品SKU | id, note_id, spec_value, price, stock |
| `order` | 订单表 | id, order_no, merchant_id, user_id, total_amount, pay_status, order_status |
| `order_item` | 订单明细 | id, order_id, note_id, sku_id, quantity, price |

#### **多语言支持表**

| 表名 | 说明 | 关键字段 |
|-----|------|---------|
| `language` | 语言配置 | id, code（zh-TW/zh-CN/en）, name |
| `note_lang` | 商品多语言 | id, note_id, lang_code, title, description |
| `article_lang` | 百科文章多语言 | id, article_id, lang_code, title, content |

#### **认证体系表**

| 表名 | 说明 | 关键字段 |
|-----|------|---------|
| `certificate` | 一物一证 | id, note_id, certificate_no, inspection_result, issue_date, valid_until |
| `certificate_image` | 证书图片 | id, certificate_id, image_url |

---

### 六、开发排期建议

| 阶段 | 周期 | 核心产出 | 人力配置 |
|-----|------|---------|---------|
| **阶段1：环境搭建与基础框架** | 1周 | 服务器环境、数据库、基础API框架 | 后端1人 |
| **阶段2：用户/商户模块** | 1.5周 | 注册登录、商户入驻、后台管理 | 后端1人 |
| **阶段3：商品/多商户商城** | 2周 | 商品管理、购物车、订单、多商户功能 | 后端1人+前端1人 |
| **阶段4：支付集成** | 1周 | PayPal+微信+支付宝三端支付 | 后端1人 |
| **阶段5：百科/新闻/视频模块** | 1.5周 | 内容管理、视频上传、多语言CMS | 后端1人+前端1人 |
| **阶段6：H5前端开发** | 2周 | uni-app多页面、多语言切换 | 前端1人 |
| **阶段7：联调测试** | 1.5周 | 全流程测试、兼容性测试 | 全员 |
| **总计** | **10.5周** | 可上线版本 | 2-3人 |

---

### 七、开发环境配置

#### **后端环境**（ThinkPHP 8.0）
```
PHP >= 8.0.2
MySQL >= 5.7 / 8.0
Redis >= 6.0
Composer >= 2.0
Nginx >= 1.18
```

#### **前端环境**（uni-app）
```
Node.js >= 16.0
HBuilderX（推荐）或 VS Code
微信开发者工具（小程序调试）
```

#### **域名配置**
```
主站：www.fubao.ltd
API：api.fubao.ltd
商户后台：merchant.fubao.ltd
图片CDN：cdn.fubao.ltd
```

---

### 八、给Cozi的开发交接清单

#### **必须阅读的文档**
1. 本技术方案（完整版）
2. ThinkPHP 8.0官方手册
3. uni-app官方文档
4. PayPal商户接入指南

#### **需要准备的账号/密钥**
- [ ] PayPal商户账号（企业）+ Client ID + Secret
- [ ] 微信支付商户号 + API密钥
- [ ] 支付宝商户号 + AppID
- [ ] 阿里云OSS账号（图片存储）
- [ ] 腾讯云点播账号（视频存储）

#### **第一步开发任务（优先级最高）**
1. **搭建ThinkPHP开发环境**，初始化项目
2. **创建数据库**，执行初始表结构SQL
3. **实现商户入驻API**（基础版）
4. **搭建uni-app H5项目**，配置多语言i18n
5. **集成PayPal沙箱环境**，跑通支付流程

#### **Git仓库规范**
```
fubao/
├── backend/          # ThinkPHP后端代码
├── frontend/         # uni-app前端代码
├── docs/             # 项目文档
└── sql/              # 数据库脚本（带版本号）
```

---

如需进一步细化某个模块的技术实现细节（如多商户分账逻辑、ElasticSearch索引设计、视频转码方案等），可继续沟通。


UI设计一定要简单大气，编辑修改要简单，最好可后台可视化编辑
## 符宝网技术方案调整版：支持后台可视化编辑

根据您提出的“UI简单大气、编辑修改简单、最好可后台可视化编辑”的要求，我们在原有技术方案基础上进行优化，引入**页面可视化编辑系统**，让运营人员可以直接在后台拖拽组件、修改内容，无需前端开发介入即可完成页面更新。

---

### 一、技术栈调整（核心变化）

| 模块 | 原方案 | **调整后方案** | 理由 |
|------|--------|--------------|------|
| **前端H5** | uni-app（纯代码） | uni-app + **动态组件渲染引擎** | 后台配置页面结构，前端动态渲染，实现可视化编辑 |
| **后台管理** | 传统表单管理 | **Vue3 + Element Plus + 可视化编辑器** | 支持拖拽式页面构建，所见即所得 |
| **内容存储** | 常规数据库表 | 增加 **页面配置表**（JSON格式） | 存储页面组件配置、样式、数据源 |
| **API接口** | 固定返回 | **动态页面接口** + 常规业务接口 | 前端根据页面ID获取组件树，动态渲染 |

---

### 二、可视化编辑系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    后台管理系统（Vue3 + Element Plus）         │
├─────────────────────────────────────────────────────────────┤
│  可视化编辑器核心组件：                                        │
│  - 组件库面板（轮播图/商品列表/文章列表/图文混排/自定义HTML）    │
│  - 画布区域（拖拽排序、实时预览）                               │
│  - 属性面板（修改组件样式、数据源配置）                         │
└─────────────────────────────────────────────────────────────┘
                                    ↓ 保存页面配置（JSON）
┌─────────────────────────────────────────────────────────────┐
│                  后端（ThinkPHP 8.0）                        │
│  新增表：page_config（页面配置表）                            │
│  新增接口：/api/page/{page_id} → 返回组件树JSON               │
└─────────────────────────────────────────────────────────────┘
                                    ↓ API调用
┌─────────────────────────────────────────────────────────────┐
│               前端H5（uni-app + 动态组件）                    │
│  根据返回的组件树，循环渲染对应组件（如swiper、goods-list等）   │
└─────────────────────────────────────────────────────────────┘
```

---

### 三、数据库设计：页面配置表

```sql
CREATE TABLE `page_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_key` varchar(50) NOT NULL COMMENT '页面标识（如home,百科列表页）',
  `page_name` varchar(100) NOT NULL COMMENT '页面名称',
  `components` json NOT NULL COMMENT '组件树配置（JSON格式）',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_key` (`page_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**components JSON 结构示例：**
```json
[
  {
    "id": "banner_001",
    "type": "swiper",
    "style": { "height": "300px", "autoplay": true },
    "dataSource": { "type": "manual", "items": [...] }
  },
  {
    "id": "hot_goods_001",
    "type": "goods-list",
    "style": { "columns": 2, "showPrice": true },
    "dataSource": { "type": "auto", "api": "/api/goods/hot", "limit": 4 }
  }
]
```

---

### 四、后台可视化编辑器实现（Vue3 + Element Plus）

#### 1. 核心界面设计

| 区域 | 功能 | 技术实现 |
|------|------|---------|
| **左侧组件库** | 显示可用组件（轮播图、商品网格、文章列表、图文模块等） | 使用 `vue-draggable` 实现拖拽添加 |
| **中间画布** | 展示页面实时布局，支持拖拽排序、选中编辑 | 基于 `gridstack.js` 或自定义CSS Grid，使用 `vue-draggable` 实现排序 |
| **右侧属性面板** | 选中组件后，修改样式、数据源、内容 | 动态表单，根据组件类型渲染不同配置项 |

#### 2. 关键依赖

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.4.0",
    "vuedraggable": "^4.1.0",
    "quill": "^2.0.0", // 富文本编辑器（图文模块）
    "axios": "^1.5.0"
  }
}
```

#### 3. 典型组件配置项

| 组件类型 | 可配置属性 | 数据源选项 |
|---------|-----------|-----------|
| 轮播图 | 高度、自动播放、指示点颜色 | 手动上传图片/自动从商品/文章获取封面 |
| 商品网格 | 每行数量、显示价格、显示销量 | 手动选择商品/自动按条件筛选（热销/新品） |
| 文章列表 | 显示摘要、显示时间、列表样式 | 手动选择文章/自动按分类筛选 |
| 图文混排 | 图片位置、文字内容 | 富文本编辑器 |
| 视频模块 | 视频地址、封面图 | 手动输入链接/从视频库选择 |

---

### 五、前端H5动态渲染机制（uni-app）

#### 1. 页面加载流程

```
用户访问页面（如首页）
    ↓
前端调用 /api/page/home
    ↓
获取 components JSON
    ↓
遍历 components，根据 type 渲染对应组件
    ↓
组件内部请求数据（如果 dataSource 是动态）
    ↓
渲染完整页面
```

#### 2. 组件映射表（动态组件）

```javascript
// components/index.js
import SwiperComponent from './SwiperComponent.vue'
import GoodsListComponent from './GoodsListComponent.vue'
import ArticleListComponent from './ArticleListComponent.vue'
import RichTextComponent from './RichTextComponent.vue'

export default {
  swiper: SwiperComponent,
  'goods-list': GoodsListComponent,
  'article-list': ArticleListComponent,
  'rich-text': RichTextComponent,
  // ... 其他组件
}
```

#### 3. 动态渲染核心代码

```vue
<template>
  <view>
    <component
      v-for="comp in pageComponents"
      :key="comp.id"
      :is="componentMap[comp.type]"
      :config="comp"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import componentMap from '@/components/dynamic'

const pageComponents = ref([])

onMounted(async () => {
  const res = await uni.request({ url: '/api/page/home' })
  pageComponents.value = res.data.components
})
</script>
```

#### 4. 组件示例：商品网格组件

```vue
<template>
  <view class="goods-grid" :style="{ columns: config.style.columns }">
    <view v-for="item in goodsList" :key="item.id" class="goods-item">
      <image :src="item.image" mode="aspectFill" />
      <text class="title">{{ item.name }}</text>
      <text class="price">¥{{ item.price }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['config'])
const goodsList = ref([])

onMounted(async () => {
  if (props.config.dataSource.type === 'auto') {
    const res = await uni.request({ url: props.config.dataSource.api })
    goodsList.value = res.data
  } else {
    goodsList.value = props.config.dataSource.items
  }
})
</script>

<style scoped>
.goods-grid {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.goods-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>
```

---

### 六、UI设计规范（简单大气）

#### 1. 设计理念
- **留白**：模块间距≥24px，内容区左右留白16px
- **克制**：主色只用玄门青（`#1A5F3C`）作为点缀，背景以白色/浅灰为主
- **清晰**：字体层级分明，重要信息用加粗/主色突出
- **一致**：所有组件圆角统一为12px，按钮统一为8px

#### 2. 关键视觉元素

| 元素 | 规范 |
|-----|------|
| 主色 | `#1A5F3C`（深青）——用于按钮、链接、重要标识 |
| 辅助色 | `#C9A87C`（古铜金）——用于认证徽章、特殊标签 |
| 背景色 | `#F8F9FA`（浅灰）用于页面，`#FFFFFF`用于卡片 |
| 圆角 | 卡片12px，按钮8px，小标签4px |
| 阴影 | 卡片使用 `0 2px 12px rgba(0,0,0,0.05)`，悬浮时加深 |
| 字体 | iOS使用SF Pro，Android使用Roboto，中文使用苹方/思源黑 |

#### 3. 页面布局模板

**首页结构**（示意）：
```
┌─────────────────────────────────┐
│ 顶部导航（简洁，仅logo+搜索+语言） │
├─────────────────────────────────┤
│       轮播图（满宽，圆角）        │
├─────────────────────────────────┤
│  分类入口（4-6个图标+文字，网格） │
├─────────────────────────────────┤
│  推荐商品（标题+更多，商品卡片）  │
├─────────────────────────────────┤
│  玄门头条（标题+列表，图文混排）  │
├─────────────────────────────────┤
│  底部Tab（首页/百科/商城/动态/我的）│
└─────────────────────────────────┘
```

#### 4. 组件样式规范

| 组件 | 样式要点 |
|-----|---------|
| 商品卡片 | 图片1:1比例，标题2行截断，价格主色大号 |
| 文章卡片 | 图片比例3:2，标题1行，摘要2行 |
| 按钮 | 主按钮高度44px，圆角8px，点击透明度变化 |
| 表单输入框 | 边框浅灰，圆角8px，聚焦时边框变主色 |

---

### 七、开发调整与排期

#### 新增开发任务（相比原方案）

| 任务 | 工作量 | 依赖 |
|-----|-------|------|
| 后台可视化编辑器页面开发 | 4天 | Vue3 + Element Plus + draggable |
| 页面配置接口开发 | 2天 | ThinkPHP + 数据库 |
| 前端动态组件库开发（10+组件） | 5天 | uni-app + 组件开发 |
| 前后端联调 | 2天 | - |
| **新增总计** | **13天** | - |

#### 更新后总开发周期（2-3人）

| 阶段 | 周期 | 产出 |
|-----|------|------|
| 环境搭建 + 基础框架 | 1周 | 环境、数据库、API基础 |
| 用户/商户模块 | 1.5周 | 注册、登录、商户入驻 |
| 商品/多商户商城 | 2周 | 商品管理、订单、多商户 |
| 支付集成 | 1周 | PayPal+微信+支付宝 |
| **可视化编辑器（新增）** | **2周** | 后台页面构建器、前端动态组件 |
| 百科/新闻/视频模块 | 1.5周 | 内容管理、视频上传 |
| 前端H5开发 | 1.5周 | 页面渲染、多语言 |
| 联调测试 | 1.5周 | 全流程测试 |
| **总计** | **12.5周** | 比原方案增加2周 |

---

### 八、给Cozi的开发指南

#### 1. 开发环境准备（同前，无变化）

#### 2. 优先开发顺序（调整后）

1. **搭建ThinkPHP + uni-app基础框架**
2. **实现用户/商户基础功能**
3. **开发可视化编辑器核心功能**（后台）
   - 先完成组件库面板 + 画布 + 属性面板的基础框架
   - 实现拖拽添加组件、排序、保存JSON
4. **实现页面配置接口**，前端能读取JSON并渲染简单组件
5. **开发前端动态组件库**（先做3-5个核心组件）
6. **集成商品、订单等业务**，并与可视化组件打通（如商品列表组件绑定数据源）
7. **完善支付、多语言等**

#### 3. 关键代码仓库结构

```
fubao/
├── backend/               # ThinkPHP后端
│   ├── app/
│   │   ├── controller/
│   │   │   ├── api/       # 前端接口
│   │   │   └── admin/     # 后台接口
│   │   ├── model/
│   │   └── service/
│   ├── public/
│   └── ...
├── frontend/              # uni-app前端
│   ├── pages/
│   │   ├── index/         # 首页
│   │   ├── goods/         # 商品详情
│   │   └── ...
│   ├── components/
│   │   ├── dynamic/       # 动态渲染组件库
│   │   └── common/
│   ├── api/
│   └── ...
├── admin/                 # 后台管理系统（Vue3）
│   ├── src/
│   │   ├── views/
│   │   │   ├── page-editor/  # 可视化编辑器
│   │   │   └── ...
│   │   ├── components/
│   │   └── ...
│   └── package.json
└── docs/
```

#### 4. 可视化编辑器技术要点

- 使用 `vue-draggable` 实现组件列表拖拽到画布
- 使用 `vuedraggable` 实现画布内组件排序
- 使用 `element-plus` 的表单组件作为属性编辑器
- 组件配置数据结构设计要支持无限嵌套（后续可支持组件嵌套）

#### 5. 简单大气的UI设计参考

- 参考**苹果官网**的极简风格：大量留白、无边框卡片、浅灰背景
- 参考**无印良品**的克制美学：只用必要元素、自然材质感
- 符宝网可适当添加**水墨元素**作为点缀（如顶部导航的祥云纹理）

---

如需进一步细化可视化编辑器的实现细节、组件库设计或动态渲染性能优化，随时沟通。
继续优化细节，给到一个可以直接给cozi编程开发的文档
# 符宝网（fubao.ltd）开发文档 v2.0

> 本文档为开发人员（Cozi）提供完整的技术方案，涵盖前端、后端、数据库、支付集成、可视化编辑器及UI规范，可直接作为开发依据。

---

## 1. 项目概述

符宝网是一个面向全球修行者的符箓法器交易与科普平台，核心功能包括：

- **多商户商城**：道观、寺庙等认证机构可入驻开店，销售符箓、法器。
- **科普内容**：符箓图鉴、法器百科、视频学堂。
- **新闻活动**：全球玄门资讯与平台活动。
- **一物一证**：平台对商品进行独立认证，出具检验证书。
- **多语言**：默认繁体中文，支持简体中文、英文等。
- **可视化编辑**：运营后台可通过拖拽组件快速编辑页面。

---

## 2. 技术栈选型

| 模块 | 技术 | 版本/说明 |
|------|------|-----------|
| **后端框架** | ThinkPHP | 8.0 |
| **数据库** | MySQL | 8.0 |
| **缓存** | Redis | 6.0+ |
| **搜索** | ElasticSearch | 7.10+（可选，初期可用MySQL全文索引替代） |
| **前端H5** | uni-app | 基于Vue3，一套代码编译H5、小程序 |
| **前端组件库** | uView UI | 2.0（或自定义） |
| **后台管理** | Vue3 + Element Plus | Vue 3.3 + Element Plus 2.4 |
| **可视化编辑器** | vue-draggable + quill | 拖拽排序、富文本编辑 |
| **支付** | PayPal + 微信支付 + 支付宝 | 集成官方SDK |
| **存储** | 阿里云OSS | 图片、视频存储 |
| **服务器** | Nginx + PHP 8.0 | 推荐使用宝塔面板管理 |

---

## 3. 数据库设计（核心表结构）

### 3.1 商户相关

```sql
-- 商户表（道观/寺庙）
CREATE TABLE `merchant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '商户名称',
  `type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1:道观 2:寺庙 3:其他',
  `logo` varchar(255) DEFAULT NULL COMMENT '商户LOGO',
  `cover` varchar(255) DEFAULT NULL COMMENT '店铺封面',
  `description` text COMMENT '店铺介绍',
  `certification_level` tinyint(1) DEFAULT '1' COMMENT '认证等级 1:普通 2:官方 3:祖庭',
  `contact_name` varchar(50) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT '0:禁用 1:启用',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商户管理员表
CREATE TABLE `merchant_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `merchant_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(1) DEFAULT '1' COMMENT '1:店主 2:店员',
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 商品相关

```sql
-- 商品表
CREATE TABLE `goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `merchant_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `subtitle` varchar(200) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL COMMENT '分类ID',
  `type` tinyint(1) DEFAULT '1' COMMENT '1:符箓 2:法器 3:供品',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `stock` int(11) DEFAULT '0',
  `images` json DEFAULT NULL COMMENT '商品图数组',
  `description` text COMMENT '商品详情',
  `is_certified` tinyint(1) DEFAULT '0' COMMENT '是否需要一物一证',
  `status` tinyint(1) DEFAULT '1',
  `sort` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品多语言表
CREATE TABLE `goods_lang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL,
  `lang_code` varchar(10) NOT NULL COMMENT 'zh-TW,zh-CN,en',
  `name` varchar(200) NOT NULL,
  `subtitle` varchar(200) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_goods_lang` (`goods_id`,`lang_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 认证证书表
CREATE TABLE `certificate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL,
  `certificate_no` varchar(50) NOT NULL COMMENT '证书编号',
  `inspection_result` text COMMENT '检验结果描述',
  `issue_date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `images` json DEFAULT NULL COMMENT '证书图片',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cert_no` (`certificate_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.3 订单与交易

```sql
-- 订单表
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL,
  `user_id` int(11) NOT NULL,
  `merchant_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `pay_amount` decimal(10,2) NOT NULL,
  `pay_status` tinyint(1) DEFAULT '0' COMMENT '0:未支付 1:已支付 2:支付失败',
  `order_status` tinyint(1) DEFAULT '0' COMMENT '0:待付款 1:待发货 2:已发货 3:已完成 4:已取消',
  `pay_method` varchar(20) DEFAULT NULL COMMENT 'paypal,wechat,alipay',
  `shipping_name` varchar(50) DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单商品明细
CREATE TABLE `order_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `goods_name` varchar(200) NOT NULL,
  `goods_image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.4 内容与多语言

```sql
-- 百科文章表
CREATE TABLE `article` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` longtext,
  `category_id` int(11) DEFAULT NULL COMMENT '分类',
  `author` varchar(50) DEFAULT NULL,
  `views` int(11) DEFAULT '0',
  `status` tinyint(1) DEFAULT '1',
  `sort` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章多语言表
CREATE TABLE `article_lang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `lang_code` varchar(10) NOT NULL,
  `title` varchar(200) NOT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_lang` (`article_id`,`lang_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 视频表
CREATE TABLE `video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `url` varchar(255) NOT NULL COMMENT '视频地址',
  `duration` int(11) DEFAULT '0' COMMENT '时长(秒)',
  `category_id` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT '0',
  `status` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.5 可视化页面配置

```sql
-- 页面配置表
CREATE TABLE `page_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_key` varchar(50) NOT NULL COMMENT '页面标识（home,百科列表页等）',
  `page_name` varchar(100) NOT NULL COMMENT '页面名称',
  `components` json NOT NULL COMMENT '组件树配置',
  `lang_code` varchar(10) DEFAULT 'zh-TW' COMMENT '语言版本',
  `status` tinyint(1) DEFAULT '1',
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_lang` (`page_key`,`lang_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.6 多语言基础表

```sql
-- 语言列表
CREATE TABLE `language` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL COMMENT 'zh-TW,zh-CN,en,ja',
  `name` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. API 接口设计（RESTful）

### 4.1 接口规范

- **基地址**：`https://api.fubao.ltd/`
- **认证**：Bearer Token（JWT），有效期7天
- **响应格式**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```
- **分页参数**：`page`、`limit`

### 4.2 主要接口列表

#### 用户模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user/register` | 注册 |
| POST | `/api/user/login` | 登录 |
| GET | `/api/user/info` | 获取用户信息 |
| PUT | `/api/user/info` | 更新用户信息 |

#### 商户模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/merchant/apply` | 申请入驻 |
| GET | `/api/merchant/info` | 获取商户信息 |
| GET | `/api/merchant/list` | 商户列表（前台） |
| GET | `/api/merchant/{id}/goods` | 商户商品列表 |

#### 商品模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/goods/list` | 商品列表（支持分类、价格筛选） |
| GET | `/api/goods/{id}` | 商品详情 |
| GET | `/api/goods/{id}/certificate` | 商品证书信息 |

#### 订单模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/order/create` | 创建订单 |
| GET | `/api/order/list` | 订单列表 |
| GET | `/api/order/{id}` | 订单详情 |
| POST | `/api/order/{id}/cancel` | 取消订单 |
| POST | `/api/order/{id}/pay` | 发起支付 |

#### 支付模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/payment/create` | 创建支付订单 |
| POST | `/api/payment/callback` | 支付回调（统一入口） |

#### 内容模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/article/list` | 文章列表 |
| GET | `/api/article/{id}` | 文章详情 |
| GET | `/api/video/list` | 视频列表 |
| GET | `/api/video/{id}` | 视频详情 |

#### 页面配置模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/page/{page_key}` | 获取页面组件配置 |
| POST | `/api/admin/page/save` | 保存页面配置（后台） |

---

## 5. 前端H5开发指南（uni-app）

### 5.1 项目初始化

使用 HBuilderX 创建 uni-app 项目，选择 Vue3 版本。

```bash
# 安装依赖
npm install
# 引入 uView UI
npm install uview-ui@2.0.0
```

### 5.2 多语言配置（i18n）

在 `locale` 目录下放置语言包，如 `zh-TW.json`、`zh-CN.json`、`en.json`。

```javascript
// main.js
import VueI18n from 'vue-i18n'
import messages from './locale/index.js'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: uni.getStorageSync('lang') || 'zh-TW',
  messages
})
// 挂载到Vue实例
```

### 5.3 动态页面渲染机制

#### 5.3.1 页面结构

在 `pages/index/index.vue` 中实现动态渲染：

```vue
<template>
  <view class="page-container">
    <component
      v-for="comp in components"
      :key="comp.id"
      :is="getComponent(comp.type)"
      :config="comp"
    />
  </view>
</template>

<script>
import { mapState } from 'vuex'
import SwiperComp from '@/components/dynamic/SwiperComp.vue'
import GoodsGrid from '@/components/dynamic/GoodsGrid.vue'
import ArticleList from '@/components/dynamic/ArticleList.vue'
import RichTextComp from '@/components/dynamic/RichTextComp.vue'
import VideoComp from '@/components/dynamic/VideoComp.vue'

export default {
  data() {
    return {
      components: [],
      componentMap: {
        swiper: SwiperComp,
        'goods-grid': GoodsGrid,
        'article-list': ArticleList,
        'rich-text': RichTextComp,
        video: VideoComp
      }
    }
  },
  onLoad() {
    this.loadPage()
  },
  methods: {
    getComponent(type) {
      return this.componentMap[type] || null
    },
    async loadPage() {
      const res = await uni.request({
        url: '/api/page/home',
        data: { lang: this.$i18n.locale }
      })
      this.components = res.data.components
    }
  }
}
</script>
```

#### 5.3.2 动态组件示例（商品网格）

`components/dynamic/GoodsGrid.vue`：

```vue
<template>
  <view class="goods-grid" :style="gridStyle">
    <view v-for="item in goodsList" :key="item.id" class="goods-item" @click="toDetail(item.id)">
      <image :src="item.images[0]" mode="aspectFill" class="goods-img" />
      <view class="goods-info">
        <text class="goods-name">{{ item.name }}</text>
        <text class="goods-price">¥{{ item.price }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      goodsList: []
    }
  },
  computed: {
    gridStyle() {
      const cols = this.config.style?.columns || 2
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '12px',
        padding: '12px'
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const { dataSource } = this.config
      if (dataSource.type === 'auto') {
        // 调用接口获取数据
        const res = await uni.request({ url: dataSource.api, data: { limit: dataSource.limit || 6 } })
        this.goodsList = res.data
      } else {
        this.goodsList = dataSource.items || []
      }
    },
    toDetail(id) {
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    }
  }
}
</script>

<style scoped>
.goods-img {
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 1:1比例 */
  background-color: #f5f5f5;
}
.goods-info {
  padding: 8px;
}
.goods-name {
  font-size: 14px;
  line-height: 20px;
  color: #1D2129;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-price {
  font-size: 16px;
  font-weight: bold;
  color: #1A5F3C;
  margin-top: 4px;
  display: block;
}
</style>
```

### 5.4 商城模块（多商户）

- 商品列表页：支持按商户筛选、分类筛选。
- 商品详情页：展示商户信息、证书入口、担保交易标识。
- 购物车：本地缓存，下单时提交。
- 下单流程：选择收货地址 → 支付 → 跳转订单详情。

### 5.5 支付集成（H5）

使用 `uni-app` 的 `payment` API 统一调用：

```javascript
// 支付示例
const pay = async (orderId, method) => {
  // 调用后端创建支付订单
  const res = await uni.request({
    url: '/api/payment/create',
    method: 'POST',
    data: { order_id: orderId, method }
  })
  const payParams = res.data
  if (method === 'wechat') {
    uni.requestPayment({
      provider: 'wxpay',
      ...payParams,
      success: () => { /* 支付成功 */ },
      fail: (err) => { /* 失败 */ }
    })
  } else if (method === 'alipay') {
    // 支付宝H5支付需要跳转
    window.location.href = payParams.url
  } else if (method === 'paypal') {
    // 渲染PayPal按钮
    this.renderPayPal(orderId, payParams.amount)
  }
}
```

---

## 6. 后台可视化编辑器开发指南（Vue3 + Element Plus）

### 6.1 项目结构

```
admin/
├── src/
│   ├── views/
│   │   └── page-editor/
│   │       ├── index.vue          # 编辑器主界面
│   │       ├── components/
│   │       │   ├── ComponentPanel.vue   # 左侧组件库
│   │       │   ├── Canvas.vue           # 中间画布
│   │       │   └── PropertyPanel.vue    # 右侧属性面板
│   │       └── componentsConfig.js      # 组件配置定义
│   ├── api/
│   │   └── page.js                # 页面配置接口
│   └── main.js
```

### 6.2 核心依赖

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.4.0",
    "vuedraggable": "^4.1.0",
    "quill": "^2.0.0",
    "axios": "^1.5.0"
  }
}
```

### 6.3 组件配置定义

`componentsConfig.js` 定义可用组件及其默认属性：

```javascript
export const componentsList = [
  {
    type: 'swiper',
    name: '轮播图',
    icon: 'Picture',
    defaultConfig: {
      style: { height: 300, autoplay: true },
      dataSource: { type: 'manual', items: [] }
    }
  },
  {
    type: 'goods-grid',
    name: '商品网格',
    icon: 'Grid',
    defaultConfig: {
      style: { columns: 2, showPrice: true },
      dataSource: { type: 'auto', api: '/api/goods/hot', limit: 4 }
    }
  },
  {
    type: 'article-list',
    name: '文章列表',
    icon: 'Document',
    defaultConfig: {
      style: { showSummary: true, showTime: true },
      dataSource: { type: 'auto', category: null, limit: 5 }
    }
  },
  {
    type: 'rich-text',
    name: '富文本',
    icon: 'Edit',
    defaultConfig: {
      content: '<p>请输入内容...</p>',
      style: { padding: '12px' }
    }
  },
  {
    type: 'video',
    name: '视频模块',
    icon: 'VideoCamera',
    defaultConfig: {
      url: '',
      cover: '',
      style: { autoplay: false }
    }
  }
]
```

### 6.4 编辑器主界面逻辑

- **左侧组件库**：使用 `draggable` 将组件列表设为可拖拽，拖拽时生成新组件对象。
- **画布**：使用 `vuedraggable` 实现组件列表排序，每个组件显示一个占位符，点击选中。
- **属性面板**：根据选中组件的类型，动态渲染表单（使用 `v-if` 或动态组件）。

关键代码片段：

```vue
<template>
  <el-container>
    <el-aside width="300px">
      <ComponentPanel :components="componentsList" @add="addComponent" />
    </el-aside>
    <el-main>
      <draggable v-model="components" group="components" item-key="id" @end="save">
        <template #item="{ element }">
          <div class="canvas-item" :class="{ active: selectedId === element.id }" @click="selectComponent(element.id)">
            <div class="item-header">{{ getComponentName(element.type) }}</div>
            <div class="item-content">
              <component :is="previewMap[element.type]" :config="element" :isPreview="true" />
            </div>
            <el-button size="small" @click.stop="removeComponent(element.id)">删除</el-button>
          </div>
        </template>
      </draggable>
    </el-main>
    <el-aside width="400px">
      <PropertyPanel v-if="selectedComponent" :component="selectedComponent" @update="updateComponent" />
    </el-aside>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
import ComponentPanel from './components/ComponentPanel.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { componentsList } from './componentsConfig'

const components = ref([])
const selectedId = ref(null)
const selectedComponent = computed(() => components.value.find(c => c.id === selectedId.value))

const addComponent = (type) => {
  const newComp = {
    id: Date.now(),
    type,
    ...componentsList.find(c => c.type === type).defaultConfig
  }
  components.value.push(newComp)
  save()
}

const save = () => {
  // 调用后端接口保存
}
</script>
```

### 6.5 属性面板实现

根据组件类型动态渲染表单，例如商品网格的属性：

```vue
<template>
  <el-form label-width="100px">
    <el-form-item label="每行数量">
      <el-input-number v-model="localConfig.style.columns" :min="1" :max="4" />
    </el-form-item>
    <el-form-item label="数据来源">
      <el-radio-group v-model="localConfig.dataSource.type">
        <el-radio label="auto">自动获取</el-radio>
        <el-radio label="manual">手动选择</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="localConfig.dataSource.type === 'auto'">
      <el-select v-model="localConfig.dataSource.api" placeholder="选择数据接口">
        <el-option label="热销商品" value="/api/goods/hot" />
        <el-option label="新品推荐" value="/api/goods/new" />
      </el-select>
      <el-input-number v-model="localConfig.dataSource.limit" :min="1" :max="20" />
    </el-form-item>
    <el-form-item v-else>
      <el-button @click="openGoodsSelector">选择商品</el-button>
      <div>已选 {{ localConfig.dataSource.items.length }} 件商品</div>
    </el-form-item>
  </el-form>
</template>
```

---

## 7. 支付集成（PayPal + 微信 + 支付宝）

### 7.1 PayPal 集成（H5）

**前端**：动态加载 PayPal JS SDK 并渲染按钮。

```html
<div id="paypal-button-container"></div>

<script>
function loadPayPalScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=HKD'
    script.onload = resolve
    document.body.appendChild(script)
  })
}

async function renderPayPalButton(orderId, amount) {
  await loadPayPalScript()
  paypal.Buttons({
    createOrder: () => orderId,
    onApprove: async (data) => {
      const res = await uni.request({
        url: '/api/payment/callback',
        method: 'POST',
        data: { paypal_order_id: data.orderID }
      })
      if (res.statusCode === 200) {
        // 跳转成功页
      }
    }
  }).render('#paypal-button-container')
}
</script>
```

**后端**：使用 PayPal PHP SDK。

```php
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;

public function createPayPalOrder($orderId, $amount) {
    $request = new OrdersCreateRequest();
    $request->prefer('return=representation');
    $request->body = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'reference_id' => $orderId,
            'amount' => [
                'currency_code' => 'HKD',
                'value' => $amount
            ]
        ]]
    ];
    $client = $this->getPayPalClient();
    $response = $client->execute($request);
    return $response->result->id; // 返回 orderID
}
```

### 7.2 微信支付

H5 支付使用 `uni.requestPayment`，参数由后端生成。

### 7.3 支付宝支付

H5 支付需跳转到支付宝返回的 `form` 或 `url`。

```javascript
// 后端返回支付页面URL
window.location.href = payUrl
```

---

## 8. UI 设计规范（简单大气）

### 8.1 颜色系统

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | 玄门青 | `#1A5F3C` |
| 点缀色 | 古铜金 | `#C9A87C` |
| 成功 | 绿 | `#36D399` |
| 警告 | 红 | `#F87272` |
| 主文字 | 深灰 | `#1D2129` |
| 辅助文字 | 中灰 | `#4E5969` |
| 边框 | 浅灰 | `#E5E6EB` |
| 背景 | 浅灰 | `#F8F9FA` |
| 卡片背景 | 白 | `#FFFFFF` |

### 8.2 字体规范

| 层级 | 字号 | 行高 | 字重 | 场景 |
|------|------|------|------|------|
| H1 | 24px | 32px | Bold | 文章标题 |
| H2 | 20px | 28px | Semibold | 模块标题 |
| 正文 | 16px | 24px | Regular | 商品名称、文章摘要 |
| 辅助 | 12px | 18px | Regular | 价格、时间、标签 |

### 8.3 间距与布局

- 基准单位：4px
- 页面边距：左右 16px（移动端）
- 模块间距：24px
- 卡片内边距：12px

### 8.4 组件样式规范

**按钮**：
- 主按钮：高度44px，背景色主色，圆角8px，字体16px，加粗。
- 次要按钮：高度40px，背景透明，边框1px solid 主色，圆角8px。

**卡片**：
- 圆角12px，背景白色，阴影 `0 2px 12px rgba(0,0,0,0.05)`
- 悬浮（PC端）阴影加深为 `0 4px 16px rgba(0,0,0,0.1)`

**表单输入框**：
- 高度44px，边框1px solid `#E5E6EB`，圆角8px，内边距12px。
- 聚焦时边框变为主色。

---

## 9. 开发环境与部署

### 9.1 本地开发环境

- **PHP**：8.0+，安装 Composer
- **MySQL**：8.0
- **Redis**：6.0+
- **Node.js**：16+
- **HBuilderX**（用于 uni-app 开发）

### 9.2 后端项目初始化

```bash
cd backend
composer install
cp .env.example .env
# 修改数据库配置
php think migrate:run
php think seed:run
php think run  # 启动开发服务器（默认8000端口）
```

### 9.3 前端H5项目初始化

```bash
cd frontend
npm install
# 运行开发模式（H5）
npm run dev:h5
```

### 9.4 后台管理项目初始化

```bash
cd admin
npm install
npm run dev
```

### 9.5 生产环境部署

- 后端：Nginx 配置反向代理，PHP-FPM 处理 ThinkPHP。
- 前端：uni-app 打包 H5 后放到 `public/h5` 目录。
- 后台：打包后放到 `public/admin` 目录。
- 静态资源（图片、视频）上传至阿里云 OSS。

---

## 10. 开发排期与任务清单（供Cozi参考）

| 阶段 | 周期 | 任务 | 产出 |
|------|------|------|------|
| 第1周 | 1周 | 环境搭建、数据库设计、基础API框架 | 可运行的后端、数据库 |
| 第2周 | 1周 | 用户模块、商户入驻、JWT认证 | 注册登录、商户申请接口 |
| 第3周 | 1周 | 商品管理、多商户后台 | 商品增删改查、商户后台 |
| 第4周 | 1周 | 订单模块、购物车 | 下单、订单列表 |
| 第5周 | 1周 | 支付集成（PayPal、微信、支付宝） | 完整支付流程 |
| 第6周 | 1周 | 百科内容模块、新闻动态 | 文章/视频管理、前端展示 |
| 第7周 | 1周 | 可视化编辑器后端接口 | 页面配置保存/读取 |
| 第8周 | 1周 | 可视化编辑器前端（后台） | 拖拽编辑界面 |
| 第9周 | 1周 | 前端H5动态渲染组件库 | 5+个动态组件 |
| 第10周 | 1周 | 多语言集成、H5页面联调 | 多语言切换、全流程测试 |
| 第11周 | 0.5周 | 性能优化、安全加固 | 代码审查、缓存配置 |
| 第12周 | 0.5周 | 部署上线、文档整理 | 生产环境运行 |

---

## 11. 附录：关键代码片段索引

- **JWT 认证中间件**：`app/middleware/Auth.php`
- **统一API响应**：`app/common/traits/ApiResponse.php`
- **多语言助手**：`app/common/helper/Lang.php`
- **支付回调处理**：`app/controller/api/Payment.php`
- **可视化编辑器保存**：`app/controller/admin/Page.php`

---

**文档结束。如有任何疑问，请及时沟通。**

页面增加一个符宝AI助手，AI助手定位为专业的符箓法器顾问，帮助用户推荐合适的内容，也作为智能客服进行使用 

## 12. 符宝AI助手模块设计

> 在现有平台基础上增加“符宝AI助手”，作为专业的符箓法器顾问与智能客服，提升用户体验与转化率。

---

### 12.1 功能定位

| 角色 | 功能 | 典型场景 |
|------|------|----------|
| **符箓法器顾问** | 根据用户需求推荐合适的符箓、法器，解答文化疑问 | “我想求事业顺利，该请什么符？” → 推荐文昌符、天官赐福符等，并解释用法 |
| **智能客服** | 解答订单、物流、售后等常见问题 | “我的订单什么时候发货？” → 查询订单状态并回复 |
| **内容推荐** | 结合百科、视频等科普内容，推荐相关文章或视频 | “什么是开光？” → 推送百科文章《开光的奥秘》 |
| **平台导购** | 引导用户浏览商品、活动、认证信息 | “有没有招财的法器？” → 展示相关商品列表 |

---

### 12.2 技术实现方案

#### 12.2.1 整体架构

```
前端（H5/小程序）  →  AI助手对话界面  →  后端对话API
                                            ↓
                                    对话管理服务（ThinkPHP）
                                            ↓
                              ┌─────────────┼─────────────┐
                              ↓             ↓             ↓
                         大模型API    知识库检索    业务接口调用
                         (OpenAI/      (向量数据库   (订单查询、
                          通义千问)      + RAG)       商品推荐)
```

#### 12.2.2 技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 大模型API | 通义千问（qwen-max）或 文心一言 | 国内合规，中文能力强，价格适中；支持流式输出 |
| 向量数据库 | Milvus / 阿里云向量检索服务 | 用于存储符箓法器知识库，实现RAG（检索增强生成） |
| 对话管理 | ThinkPHP 自定义服务 | 管理会话、上下文、调用大模型、调用业务API |
| 前端组件 | uni-app 自定义聊天组件 | 支持文字、语音输入，消息气泡，流式输出 |

#### 12.2.3 数据库设计

新增两张表：

```sql
-- AI助手会话表
CREATE TABLE `ai_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID，未登录可为空',
  `session_id` varchar(64) NOT NULL COMMENT '会话唯一标识',
  `title` varchar(100) DEFAULT NULL COMMENT '会话标题（自动生成）',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI助手消息表
CREATE TABLE `ai_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `role` tinyint(1) NOT NULL COMMENT '0:用户 1:AI',
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 12.2.4 API接口设计

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/chat` | 发送消息，返回AI回复（支持流式） |
| GET | `/api/ai/sessions` | 获取用户会话列表 |
| GET | `/api/ai/messages/{session_id}` | 获取某个会话的历史消息 |
| DELETE | `/api/ai/session/{session_id}` | 删除会话 |

**请求参数（/api/ai/chat）**：

```json
{
  "session_id": "abc123",  // 可选，新会话时可不传
  "message": "我想求事业顺利，该请什么符？"
}
```

**响应（非流式）**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "message_id": 123,
    "content": "根据您的需求，推荐请文昌符或天官赐福符...",
    "suggestions": [     // 可选，推荐相关商品/文章
      { "type": "goods", "id": 101, "name": "文昌符", "url": "/pages/goods/detail?id=101" },
      { "type": "article", "id": 88, "title": "文昌符的奥秘", "url": "/pages/article/detail?id=88" }
    ]
  }
}
```

#### 12.2.5 后端对话处理流程（核心）

```php
// app/service/AiChatService.php

public function chat($userId, $sessionId, $message)
{
    // 1. 获取或创建会话
    $session = $this->getOrCreateSession($userId, $sessionId);
    
    // 2. 保存用户消息
    $this->saveMessage($session->id, 0, $message);
    
    // 3. 获取历史消息（最近10轮）
    $history = $this->getHistory($session->id, 10);
    
    // 4. 构造prompt（系统角色定义 + 上下文）
    $prompt = $this->buildPrompt($message, $history);
    
    // 5. 判断是否需要调用外部工具（function calling）
    $toolCalls = $this->checkToolNeeds($message);
    if ($toolCalls) {
        $toolResult = $this->executeTool($toolCalls);
        // 将工具结果追加到prompt
        $prompt .= "\n工具返回结果：".json_encode($toolResult, JSON_UNESCAPED_UNICODE);
    }
    
    // 6. 调用大模型（支持流式）
    $aiResponse = $this->callLLM($prompt);
    
    // 7. 解析AI回复中的推荐内容（如商品、文章ID）
    $recommendations = $this->parseRecommendations($aiResponse);
    
    // 8. 保存AI消息
    $this->saveMessage($session->id, 1, $aiResponse);
    
    // 9. 返回结果（含推荐）
    return [
        'message_id' => $lastId,
        'content' => $aiResponse,
        'recommendations' => $recommendations
    ];
}
```

#### 12.2.6 系统角色与知识库（RAG）

**系统角色定义**（每次请求发送给大模型）：

```
你是一位专业的符箓法器顾问，名叫“符宝”，隶属于符宝网。你的职责是：
1. 为用户推荐合适的符箓、法器，解答文化疑问。
2. 解答平台使用、订单、物流等客服问题。
3. 结合平台百科内容，提供专业、亲切的回答。
4. 回答要符合中国宗教政策，不涉及迷信或非法内容。
5. 如果用户的问题涉及敏感内容（如邪术、害人符），应礼貌拒绝并引导向正信。

当推荐商品时，可以引用具体商品ID，例如：[goods:101]文昌符[/goods]。
当推荐文章时，可以引用文章ID，例如：[article:88]文昌符的奥秘[/article]。
```

**知识库构建**：
- 将平台百科文章、商品介绍、常见问题等文本向量化，存入向量数据库。
- 在用户提问时，先检索最相关的3-5条知识，作为上下文注入到大模型prompt中，提高回答准确性。

#### 12.2.7 工具调用（Function Calling）

为了支持查询订单、商品推荐等业务功能，需要定义工具（函数），让大模型判断何时调用。

**示例工具定义**：

```json
{
  "name": "query_order_status",
  "description": "查询用户订单状态",
  "parameters": {
    "type": "object",
    "properties": {
      "order_no": { "type": "string", "description": "订单号" }
    },
    "required": ["order_no"]
  }
}
```

当用户说“我的订单123456发货了吗？”，大模型会返回调用此工具的请求，后端执行后把结果返回给大模型生成最终答案。

---

### 12.3 前端H5实现

#### 12.3.1 UI设计

- **入口**：右下角悬浮圆形按钮，点击展开对话窗口。
- **对话窗口**：半屏或全屏（移动端），包含消息列表、输入框、语音输入按钮。
- **消息气泡**：用户消息右对齐，AI消息左对齐，支持Markdown渲染（加粗、列表、链接）。
- **推荐卡片**：AI回复中的推荐商品/文章，以横向滚动卡片形式展示。

#### 12.3.2 关键组件代码

`pages/ai/chat.vue`（简化版）：

```vue
<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToView">
      <view v-for="msg in messages" :key="msg.id" :id="'msg-'+msg.id" class="message-item" :class="{ 'user': msg.role === 0, 'ai': msg.role === 1 }">
        <view class="avatar" v-if="msg.role === 1">
          <image src="/static/ai-avatar.png" mode="aspectFill" />
        </view>
        <view class="bubble">
          <rich-text :nodes="formatMessage(msg.content)" v-if="msg.role === 1"></rich-text>
          <text v-else>{{ msg.content }}</text>
          <view v-if="msg.recommendations && msg.recommendations.length" class="recommendations">
            <scroll-view scroll-x class="rec-scroll">
              <view v-for="rec in msg.recommendations" :key="rec.id" class="rec-card" @click="goto(rec)">
                <image :src="rec.cover" mode="aspectFill" />
                <text>{{ rec.name }}</text>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区 -->
    <view class="input-area">
      <input type="text" v-model="inputMsg" placeholder="输入你的问题..." @confirm="sendMessage" />
      <button @click="sendMessage" :disabled="!inputMsg.trim()">发送</button>
      <button @click="startVoiceInput" v-if="showVoice">🎤</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      inputMsg: '',
      sessionId: null,
      scrollToView: ''
    }
  },
  onLoad() {
    this.loadSession()
  },
  methods: {
    async loadSession() {
      // 从缓存获取sessionId，或创建新会话
      let sessionId = uni.getStorageSync('ai_session_id')
      if (!sessionId) {
        // 请求后端创建会话
        const res = await uni.request({ url: '/api/ai/session', method: 'POST' })
        sessionId = res.data.session_id
        uni.setStorageSync('ai_session_id', sessionId)
      }
      this.sessionId = sessionId
      // 加载历史消息
      const res = await uni.request({ url: `/api/ai/messages/${sessionId}` })
      this.messages = res.data
      this.scrollToBottom()
    },
    async sendMessage() {
      if (!this.inputMsg.trim()) return
      const userMsg = { id: Date.now(), role: 0, content: this.inputMsg }
      this.messages.push(userMsg)
      this.inputMsg = ''
      this.scrollToBottom()

      // 调用AI接口（支持流式）
      const res = await uni.request({
        url: '/api/ai/chat',
        method: 'POST',
        data: { session_id: this.sessionId, message: userMsg.content }
      })
      const aiMsg = {
        id: res.data.message_id,
        role: 1,
        content: res.data.content,
        recommendations: res.data.recommendations
      }
      this.messages.push(aiMsg)
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const lastMsg = this.messages[this.messages.length - 1]
        if (lastMsg) this.scrollToView = `msg-${lastMsg.id}`
      })
    },
    formatMessage(content) {
      // 将 [goods:123]文昌符[/goods] 替换为可点击链接
      return content.replace(/\[goods:(\d+)\](.*?)\[\/goods\]/g, '<a href="/pages/goods/detail?id=$1">$2</a>')
    }
  }
}
</script>
```

#### 12.3.3 悬浮入口（首页及其他页面）

在全局组件中增加一个悬浮按钮，点击打开AI助手页面（新页面或侧边栏）。

```vue
<template>
  <view class="ai-float-btn" @click="openAiChat">
    <image src="/static/ai-icon.png" mode="aspectFill" />
  </view>
</template>

<script>
export default {
  methods: {
    openAiChat() {
      uni.navigateTo({ url: '/pages/ai/chat' })
    }
  }
}
</script>

<style>
.ai-float-btn {
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 56px;
  height: 56px;
  background: #1A5F3C;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.ai-float-btn image {
  width: 32px;
  height: 32px;
}
</style>
```

---

### 12.4 合规与安全

- **内容审核**：所有用户消息和AI回复需通过阿里云内容安全API审核，过滤敏感词。
- **回答限制**：明确禁止AI回答涉及政治、暴力、色情、迷信（如“保证发财”、“必能害人”）等内容，prompt中强化约束。
- **用户隐私**：会话数据仅用于AI服务，不用于其他目的。用户可删除聊天记录。
- **宗教政策**：强调“符箓文化作为非物质文化遗产，其功效因人而异，请理性看待”。

---

### 12.5 开发排期（新增）

| 任务 | 工作量 | 说明 |
|------|-------|------|
| 数据库设计 & 会话管理API | 0.5天 | 建表、CRUD接口 |
| 大模型API集成（非流式） | 1天 | 对接通义千问/文心，实现基础对话 |
| 知识库向量化与检索 | 2天 | 将百科文章向量化，集成RAG |
| 工具调用（订单查询等） | 1.5天 | 实现function calling |
| 前端聊天界面开发 | 2天 | uni-app组件、流式渲染、悬浮按钮 |
| 联调与优化 | 1天 | 测试各种场景，优化prompt |
| **总计** | **8天** | 约1.5周 |

---

### 12.6 后续优化方向

- **语音输入**：集成微信/百度语音识别API，支持语音提问。
- **多模态**：用户上传符箓图片，AI识别并提供解读（需图像识别模型）。
- **个性化推荐**：根据用户浏览历史、购买记录，AI更精准推荐。
- **多语言支持**：AI根据当前语言环境自动切换回答语言。

---

**文档更新完毕。**