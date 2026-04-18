/**
 * @fileoverview 证书查询页面重定向
 * @description 重定向到新的证书验证路径 /verify
 * @module app/certificate/page
 */

import { redirect } from 'next/navigation';

export default function CertificatePage() {
  redirect('/verify');
}
