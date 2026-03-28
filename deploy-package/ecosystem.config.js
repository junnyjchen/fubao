/**
 * PM2 配置文件
 * 用于生产环境进程管理
 */

module.exports = {
  apps: [
    {
      name: 'fubao-web',
      script: 'dist/server.js',
      cwd: '/www/wwwroot/fubao.ltd',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        COZE_PROJECT_ENV: 'PROD',
        COZE_PROJECT_DOMAIN_DEFAULT: 'fubao.ltd'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/www/wwwlogs/fubao/error.log',
      out_file: '/www/wwwlogs/fubao/out.log',
      log_file: '/www/wwwlogs/fubao/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 进程异常时重启
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      // 优雅关闭
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
