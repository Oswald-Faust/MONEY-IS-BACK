'use client';

import Link from 'next/link';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Instagram 
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const LandingFooter = () => {
    const { t } = useTranslation();

    return (
        <footer className="py-20 px-6 bg-bg-deep border-t border-glass-border">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 mb-20">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-glass-bg flex items-center justify-center border border-glass-border">
                                <span className="text-text-main font-bold text-xs">M</span>
                            </div>
                            <span className="text-text-main font-bold text-xl">MONEY IS BACK</span>
                        </Link>
                        <p className="text-text-dim text-sm mb-6 max-w-sm">
                            {t.footer.description}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-glass-bg flex items-center justify-center text-text-muted hover:bg-glass-hover hover:text-text-main transition-colors border border-glass-border">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-glass-bg flex items-center justify-center text-text-muted hover:bg-glass-hover hover:text-text-main transition-colors border border-glass-border">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-glass-bg flex items-center justify-center text-text-muted hover:bg-glass-hover hover:text-text-main transition-colors border border-glass-border">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-glass-bg flex items-center justify-center text-text-muted hover:bg-glass-hover hover:text-text-main transition-colors border border-glass-border">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                    
                    {/* Columns */}
                    <div>
                        <h4 className="text-text-main font-bold mb-6">{t.footer.productTitle}</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link href="/#features" className="hover:text-accent-primary transition-colors">{t.footer.features}</Link></li>
                            <li><Link href="/#pricing" className="hover:text-accent-primary transition-colors">{t.navbar.pricing}</Link></li>
                            <li><Link href="/security" className="hover:text-accent-primary transition-colors">{t.footer.security}</Link></li>
                            <li><Link href="/changelog" className="hover:text-accent-primary transition-colors">{t.footer.changelog}</Link></li>
                            <li><Link href="/integrations" className="hover:text-accent-primary transition-colors">{t.footer.integrations}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-text-main font-bold mb-6">{t.footer.companyTitle}</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link href="/about" className="hover:text-accent-primary transition-colors">{t.footer.about}</Link></li>
                            <li><Link href="/careers" className="hover:text-accent-primary transition-colors">{t.footer.careers}</Link></li>
                            <li><Link href="/blog" className="hover:text-accent-primary transition-colors">{t.footer.blog}</Link></li>
                            <li><Link href="/contact" className="hover:text-accent-primary transition-colors">{t.footer.contact}</Link></li>
                            <li><Link href="/partners" className="hover:text-accent-primary transition-colors">{t.footer.partners}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-text-main font-bold mb-6">{t.footer.resourcesTitle}</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link href="/docs" className="hover:text-accent-primary transition-colors">{t.footer.documentation}</Link></li>
                            <li><Link href="/community" className="hover:text-accent-primary transition-colors">{t.footer.community}</Link></li>
                            <li><Link href="/help" className="hover:text-accent-primary transition-colors">{t.footer.helpCenter}</Link></li>
                            <li><Link href="/status" className="hover:text-accent-primary transition-colors">{t.footer.status}</Link></li>
                            <li><Link href="/api-docs" className="hover:text-accent-primary transition-colors">{t.footer.api}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-text-main font-bold mb-6">{t.footer.legalTitle}</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link href="/privacy" className="hover:text-accent-primary transition-colors">{t.footer.privacy}</Link></li>
                            <li><Link href="/terms" className="hover:text-accent-primary transition-colors">{t.footer.terms}</Link></li>
                            <li><Link href="/cookies" className="hover:text-accent-primary transition-colors">{t.footer.cookies}</Link></li>
                            <li><Link href="/licenses" className="hover:text-accent-primary transition-colors">{t.footer.licenses}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-text-muted/60 text-sm">
                        {t.common.allRightsReserved}
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-text-muted">
                        <span>{t.common.madeWithLove}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
