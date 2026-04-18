/**
 * @fileoverview 商户入驻申请成功页面
 * @description 显示申请提交成功信息
 * @module app/merchant/apply/success/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Store, Clock, Bell } from 'lucide-react';

export default function MerchantApplySuccessPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-8 pb-6 text-center">
          {/* 成功图标 */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">申請已提交成功</h1>
          <p className="text-muted-foreground mb-6">
            感謝您申請入駐符寶網，我們將盡快審核您的申請
          </p>

          {/* 审核流程提示 */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              接下來
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>審核時間：1-3個工作日</span>
              </li>
              <li className="flex items-center gap-2">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>審核結果將通過郵件通知您</span>
              </li>
              <li className="flex items-center gap-2">
                <Store className="w-4 h-4 flex-shrink-0" />
                <span>審核通過後即可開始經營店鋪</span>
              </li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/">返回首頁</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/user">進入用戶中心</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            如有疑問請聯繫客服
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
