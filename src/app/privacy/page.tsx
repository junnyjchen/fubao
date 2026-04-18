'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useI18n();
  const content = t.legal.privacyContent;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t.legal.privacy}</h1>
            <p className="text-sm text-muted-foreground">{t.legal.lastUpdated}：2024年1月1日</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>引言</h2>
            <p>{content.intro}</p>

            <h2>{content.sections.collect.title}</h2>
            <p>{content.sections.collect.desc}</p>
            
            <h3>{content.sections.collect.items.register.title}</h3>
            <ul>
              {content.sections.collect.items.register.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{content.sections.collect.items.transaction.title}</h3>
            <ul>
              {content.sections.collect.items.transaction.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{content.sections.collect.items.device.title}</h3>
            <ul>
              {content.sections.collect.items.device.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{content.sections.collect.items.logs.title}</h3>
            <ul>
              {content.sections.collect.items.logs.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{content.sections.usage.title}</h2>
            <p>{content.sections.usage.desc}</p>
            <ul>
              {content.sections.usage.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{content.sections.share.title}</h2>
            <p>{content.sections.share.desc}</p>
            
            <h3>{content.sections.share.items.consent.title}</h3>
            <p>{content.sections.share.items.consent.desc}</p>

            <h3>{content.sections.share.items.providers.title}</h3>
            <p>{content.sections.share.items.providers.desc}</p>
            <ul>
              {content.sections.share.items.providers.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>{content.sections.share.items.legal.title}</h3>
            <p>{content.sections.share.items.legal.desc}</p>

            <h2>{content.sections.security.title}</h2>
            <p>{content.sections.security.desc}</p>
            <ul>
              {content.sections.security.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{content.sections.rights.title}</h2>
            <p>{content.sections.rights.desc}</p>
            
            <h3>{content.sections.rights.items.access.title}</h3>
            <p>{content.sections.rights.items.access.desc}</p>

            <h3>{content.sections.rights.items.correct.title}</h3>
            <p>{content.sections.rights.items.correct.desc}</p>

            <h3>{content.sections.rights.items.delete.title}</h3>
            <p>{content.sections.rights.items.delete.desc}</p>

            <h3>{content.sections.rights.items.withdraw.title}</h3>
            <p>{content.sections.rights.items.withdraw.desc}</p>

            <h3>{content.sections.rights.items.portable.title}</h3>
            <p>{content.sections.rights.items.portable.desc}</p>

            <h2>{content.sections.cookie.title}</h2>
            <p>{content.sections.cookie.desc}</p>
            <ul>
              {content.sections.cookie.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p>{content.sections.cookie.note}</p>

            <h2>{content.sections.children.title}</h2>
            <p>{content.sections.children.desc}</p>

            <h2>{content.sections.updates.title}</h2>
            <p>{content.sections.updates.desc}</p>

            <h2>{content.sections.contact.title}</h2>
            <p>{content.sections.contact.desc}</p>
            <ul>
              {content.sections.contact.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/terms">{t.legal.viewTerms}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
