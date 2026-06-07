
# 宝塔面板部署指南

## 📋 项目技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + shadcn/ui + Tailwind CSS 4
- **语言**: TypeScript 5
- **包管理**: pnpm
- **端口**: 5000
- **数据库**: 内存 Mock（可扩展为 MySQL）

---

## 🚀 宝塔面板部署步骤

### 第一步：在宝塔面板创建网站

1. **登录宝塔面板**
   - 访问：http://116.204.135.69:8888（或你的宝塔端口）
   - 输入用户名和密码登录

2. **创建网站**
   - 点击左侧菜单「网站」→「添加站点」
   - **域名**: 填写 `116.204.135.69`（或你的域名）
   - **数据库**: 选择「不创建」（项目暂时使用内存数据库）
   - **PHP版本**: 选择「纯静态」
   - 点击「提交」

3. **网站创建成功后**
   - 在网站列表中找到刚创建的网站
   - 点击「设置」进入网站设置页面

---

### 第二步：安装 Node.js 和 pnpm

#### 方法一：使用宝塔软件商店（推荐）

1. **安装 Node.js**
   - 点击左侧菜单「软件商店」
   - 搜索「Node.js」
   - 安装 **Node.js 20.x** 或更高版本
   - 安装完成后，在「已安装」中找到 Node.js，点击「设置」
   - 确保 Node.js 版本 &gt;= 20

2. **安装 pnpm**
   - 在宝塔面板中，点击左侧菜单「终端」
   - 或者使用 SSH 连接到服务器：
     ```bash
     ssh root@116.204.135.69
     # 密码: X3bNZ3nVc5LH
     ```
   - 执行以下命令安装 pnpm：
     ```bash
     npm install -g pnpm
     pnpm -v  # 检查安装，应该显示版本号
     ```

---

### 第三步：上传代码（Git 方式）

#### 方式一：使用宝塔终端（推荐）

1. **进入网站根目录**
   ```bash
   cd /www/wwwroot/116.204.135.69
   # 注意：如果你的网站目录名不同，请替换为实际目录名
   ```

2. **克隆 GitHub 仓库**
   ```bash
   git clone https://github.com/junnyjchen/fubao.git .
   # 注意末尾的点，表示克隆到当前目录
   ```

3. **如果目录不为空，先清空**
   ```bash
   # 备份原有文件（可选）
   mv index.html index.html.bak
   
   # 然后克隆
   git clone https://github.com/junnyjchen/fubao.git .
   ```

---

#### 方式二：使用宝塔 Git 插件

1. **安装 Git 插件**
   - 在宝塔「软件商店」搜索「Git」
   - 安装「Git 版本控制」插件

2. **配置 Git 仓库**
   - 进入网站设置
   - 点击「Git」选项卡
   - 填写仓库地址：`https://github.com/junnyjchen/fubao.git`
   - 选择分支：`main`
   - 点击「克隆」

---

### 第四步：安装依赖和构建

1. **进入项目目录**
   ```bash
   cd /www/wwwroot/116.204.135.69
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **构建生产版本**
   ```bash
   pnpm build
   ```

---

### 第五步：配置 PM2 管理器

#### 方法一：使用宝塔 PM2 管理器（推荐）

1. **安装 PM2 管理器**
   - 在宝塔「软件商店」搜索「PM2」
   - 安装「PM2 管理器」

2. **添加项目**
   - 打开 PM2 管理器
   - 点击「添加项目」
   - **项目名称**: `fubao`
   - **启动文件**: `/www/wwwroot/116.204.135.69/node_modules/next/dist/bin/next`
   - **项目目录**: `/www/wwwroot/116.204.135.69`
   - **启动参数**: `start -p 5000`
   - 点击「提交」

3. **启动项目**
   - 在 PM2 列表中找到 `fubao` 项目
   - 点击「启动」
   - 查看状态，确保显示「运行中」

---

#### 方法二：使用命令行 PM2

1. **全局安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **创建启动脚本**
   ```bash
   cd /www/wwwroot/116.204.135.69
   ```

3. **启动项目**
   ```bash
   pm2 start npm --name "fubao" -- start
   ```

4. **设置开机自启**
   ```bash
   pm2 save
   pm2 startup
   ```

---

### 第六步：配置 Nginx 反向代理

1. **进入网站设置**
   - 在宝塔网站列表中找到你的网站
   - 点击「设置」

2. **配置反向代理**
   - 点击「反向代理」选项卡
   - 点击「添加反向代理」
   - **代理名称**: `fubao`
   - **目标URL**: `http://127.0.0.1:5000`
   - **发送域名**: `$host`
   - 点击「提交」

3. **修改代理配置（高级选项）**
   - 点击刚创建的反向代理的「配置文件」
   - 替换为以下配置：
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
   }
   
   # WebSocket 支持（如需要）
   location /ws/ {
       proxy_pass http://127.0.0.1:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_read_timeout 86400;
   }
   ```
   - 点击「保存」

---

### 第七步：开放防火墙端口

1. **在宝塔面板中开放端口**
   - 点击左侧菜单「安全」
   - 添加端口规则：
     - **端口**: `5000`
     - **策略**: `放行`
     - **备注**: `Next.js`
   - 点击「添加」

2. **如果使用云服务器，还需要在云服务商控制台开放端口**
   - 阿里云/腾讯云/华为云等安全组中添加 5000 端口

---

## ✅ 部署完成！

访问你的网站：**http://116.204.135.69**

---

## 🔄 日常更新流程

### 方式一：使用宝塔 Git 插件

1. 进入网站设置 → Git
2. 点击「拉取」
3. 等待代码拉取完成
4. 在 PM2 管理器中重启项目

---

### 方式二：使用命令行

```bash
cd /www/wwwroot/116.204.135.69

# 拉取最新代码
git pull origin main

# 安装新依赖（如有）
pnpm install

# 重新构建
pnpm build

# 重启 PM2
pm2 restart fubao
```

---

## 📊 常用管理命令

### PM2 命令
```bash
pm2 list                    # 查看所有项目
pm2 status fubao           # 查看项目状态
pm2 logs fubao             # 查看日志
pm2 restart fubao          # 重启项目
pm2 stop fubao             # 停止项目
pm2 start fubao            # 启动项目
```

### Git 命令
```bash
git status                  # 查看状态
git log --oneline           # 查看提交记录
git pull origin main        # 拉取最新代码
```

---

## 🐛 故障排查

### 问题：网站无法访问

**检查清单**：
1. PM2 项目是否在运行？
   ```bash
   pm2 status
   ```
2. 端口 5000 是否被占用？
   ```bash
   netstat -tlnp | grep 5000
   ```
3. Nginx 配置是否正确？
   ```bash
   nginx -t
   ```
4. 防火墙是否开放了 80/443/5000 端口？

### 问题：PM2 启动失败

**查看日志**：
```bash
pm2 logs fubao --lines 50
```

**常见原因**：
- 依赖未安装：运行 `pnpm install`
- 构建失败：运行 `pnpm build` 查看错误
- 端口被占用：修改端口或停止占用程序

### 问题：Git 拉取失败

**检查网络连接**：
```bash
ping github.com
```

**检查 Git 配置**：
```bash
git remote -v
git status
```

---

## 🔐 安全建议

1. **修改宝塔默认端口**
2. **启用 HTTPS**（使用宝塔 Let's Encrypt 免费证书）
3. **定期备份数据库和网站文件**
4. **更新 Node.js 和系统包**
5. **使用强密码**

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. PM2 日志：`pm2 logs fubao`
2. Nginx 日志：`/www/wwwlogs/`
3. 系统日志：`/var/log/`

详细文档请参考 `GIT_DEPLOY.md` 和 `DEPLOYMENT.md`！

