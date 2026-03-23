/**
 * @fileoverview 证书验证详情页
 * @description 根据证书编号显示验证结果
 * @module app/verify/[id]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CertificateDetailPage } from '@/components/certificate/CertificateDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `證書 ${id} - 符寶網認證`,
    description: `驗證證書編號 ${id} 的真偽與認證信息`,
  };
}

export default async function CertificateVerifyRoute({ params }: PageProps) {
  const { id } = await params;
  
  return <CertificateDetailPage certificateNo={id} />;
}
