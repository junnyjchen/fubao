# 符寶網 快速部署指南

## 架构

```
用户 → Nginx (宝塔) → /api/* → PHP-FPM (宿主机)
                     → /*    → Docker Next.js (:3000)
```

## 服务器环境

| 项目 | 值 |
|------|-----|
| 网站目录 | `/www/wwwroot/fubao` |
| 域名 | `www.fubao.ltd` |
| 面板 | 宝塔面板 |
| Docker | Next.js SSR（端口映射 5000→3000） |
| PHP | 宿主机 PHP-FPM（宝塔安装） |
| MySQL | 宿主机（宝塔安装） |

---

## 一键部署

```bash
# 1. 克隆项目到网站目录
cd /www/wwwroot
git clone https://github.com/junnyjchen/fubao.git fubao
cd fubao

# 2. 配置 .env（数据库密码等）
cp .env.example .env
vi .env

# 3. 一键部署
bash update-fubao.sh --rebuild
```

---

## 更新部署

```bash
cd /www/wwwroot/fubao
bash update-fubao.sh              # 增量更新
bash update-fubao.sh --rebuild     # 强制重建镜像
```

---

## 常用命令

```bash
# Docker 容器
docker ps -f name=fubao-nextjs     # 查看容器状态
docker logs -f fubao-nextjs        # 查看日志
docker restart fubao-nextjs        # 重启

# PHP 环境检测
bash update-fubao.sh --check-php
```
