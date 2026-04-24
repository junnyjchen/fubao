/**
 * @fileoverview AI助手页面
 * @description 符宝网AI智能助手页面
 * @module app/ai-assistant/page
 */

import { Metadata } from 'next';
import { AIChat } from '@/components/ai/AIChat';
import { QuickStartAI, AIAbilityCard } from '@/components/ai/QuickStartAI';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  BookOpen,
  Shield,
  HelpCircle,
  MessageSquare,
  Zap,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI助手 - 符寶網',
  description: '符寶網AI智能助手，為您解答玄門文化、符箓法器、風水命理等問題',
};

// 功能特性
const FEATURES = [
  {
    icon: BookOpen,
    title: '文化科普',
    description: '解答道教文化、符箓法器、風水命理等問題',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: Sparkles,
    title: '產品諮詢',
    description: '介紹符寶網商品，幫助選擇合適的符箓法器',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Shield,
    title: '證書查詢',
    description: '了解一物一證認證體系，查詢商品真偽',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    icon: HelpCircle,
    title: '使用指導',
    description: '指導正確使用符箓法器的方法和注意事項',
    color: 'bg-purple-500/10 text-purple-600',
  },
];

// 使用提示
const TIPS = [
  { icon: MessageSquare, text: '可以詢問符籙的種類和用途' },
  { icon: Zap, text: '嘗試更具體的問題獲得更準確的回答' },
  { icon: Clock, text: 'AI會根據對話上下文提供更個性化的建議' },
];

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI智能助手</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            符寶AI助手
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            我們的AI助手熟悉玄門文化知識，可以為您解答符籙法器、風水命理等問題，
            幫助您更好地了解和使用符寶網的服務。
          </p>
        </div>
      </section>

      {/* 能力展示 */}
      <section className="container mx-auto px-4 py-8">
        <AIAbilityCard />
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Component */}
          <div className="lg:col-span-2">
            <AIChat />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">服務功能</h3>
                <div className="space-y-4">
                  {FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  快速開始
                </h3>
                <QuickStartAI variant="minimal" />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">使用提示</h3>
                <ul className="space-y-3">
                  {TIPS.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <tip.icon className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground text-center">
                  AI助手提供的信息僅供參考，不構成專業建議。
                  如有重要決策，請諮詢專業人士。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
