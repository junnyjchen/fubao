/**
 * @fileoverview 证书验证页面
 * @description 一物一证证书查询验证入口页
 * @module app/verify/page
 */

import { Metadata } from 'next';
import { CertificateVerifyPage } from '@/components/certificate/CertificateVerifyPage';

export const metadata: Metadata = {
  title: '證書驗證 - 符寶網',
  description: '一物一證認證查詢，驗證商品真偽與認證信息',
};

export default function VerifyPage() {
  return <CertificateVerifyPage />;
}
