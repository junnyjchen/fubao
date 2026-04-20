#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# 安装依赖
pnpm install

# 构建项目
pnpm build
