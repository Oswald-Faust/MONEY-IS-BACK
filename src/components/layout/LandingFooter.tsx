'use client';

import Link from 'next/link';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Instagram 
} from 'lucide-react';

export const LandingFooter = () => (
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
                        La plateforme tout-en-un pour gérer vos projets, vos équipes et votre croissance. 
                        Construit pour les bâtisseurs.
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
                    <h4 className="text-text-main font-bold mb-6">Produit</h4>
                    <ul className="space-y-4 text-sm text-text-muted">
                        <li><Link href="/#features" className="hover:text-accent-primary transition-colors">Fonctionnalités</Link></li>
                        <li><Link href="/#pricing" className="hover:text-accent-primary transition-colors">Tarifs</Link></li>
                        <li><Link href="/security" className="hover:text-accent-primary transition-colors">Sécurité</Link></li>
                        <li><Link href="/changelog" className="hover:text-accent-primary transition-colors">Changelog</Link></li>
                        <li><Link href="/integrations" className="hover:text-accent-primary transition-colors">Intégrations</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-text-main font-bold mb-6">Entreprise</h4>
                    <ul className="space-y-4 text-sm text-text-muted">
                        <li><Link href="/about" className="hover:text-accent-primary transition-colors">À propos</Link></li>
                        <li><Link href="/careers" className="hover:text-accent-primary transition-colors">Carrières</Link></li>
                        <li><Link href="/blog" className="hover:text-accent-primary transition-colors">Blog</Link></li>
                        <li><Link href="/contact" className="hover:text-accent-primary transition-colors">Contact</Link></li>
                        <li><Link href="/partners" className="hover:text-accent-primary transition-colors">Partenaires</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-text-main font-bold mb-6">Ressources</h4>
                    <ul className="space-y-4 text-sm text-text-muted">
                        <li><Link href="/docs" className="hover:text-accent-primary transition-colors">Documentation</Link></li>
                        <li><Link href="/community" className="hover:text-accent-primary transition-colors">Communauté</Link></li>
                        <li><Link href="/help" className="hover:text-accent-primary transition-colors">Help Center</Link></li>
                        <li><Link href="/status" className="hover:text-accent-primary transition-colors">Status</Link></li>
                        <li><Link href="/api-docs" className="hover:text-accent-primary transition-colors">API</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-text-main font-bold mb-6">Légal</h4>
                    <ul className="space-y-4 text-sm text-text-muted">
                        <li><Link href="/privacy" className="hover:text-accent-primary transition-colors">Confidentialité</Link></li>
                        <li><Link href="/terms" className="hover:text-accent-primary transition-colors">CGU</Link></li>
                        <li><Link href="/cookies" className="hover:text-accent-primary transition-colors">Cookies</Link></li>
                        <li><Link href="/licenses" className="hover:text-accent-primary transition-colors">Licences</Link></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-text-muted/60 text-sm">
                    © 2026 MONEY IS BACK Inc. Tous droits réservés.
                </div>
                <div className="flex gap-8 text-sm font-medium text-text-muted">
                    <span>Fait avec ❤️ à Paris</span>
                </div>
            </div>
        </div>
    </footer>
);
