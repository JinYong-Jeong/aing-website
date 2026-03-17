import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-aing-border bg-aing-dark">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="A.ing" className="h-7 w-auto opacity-80" />
              <span className="text-xs font-mono text-aing-muted">@ Gachon Univ.</span>
            </div>
            <p className="text-aing-muted text-sm leading-relaxed">
              학부생 주도 인공지능 학술 동아리.<br />
              이론을 코드로, 코드를 통찰로.
            </p>
            <div className="flex items-center gap-2 text-aing-muted text-xs">
              <MapPin size={12} />
              <span>가천대학교 AI관</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-aing-white">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'About', to: '/about' },
                { label: 'Activities', to: '/activities' },
                { label: 'Members', to: '/members' },
                { label: 'Board', to: '/board' },
                { label: 'Contact', to: '/contact' },
                { label: 'Join Us', to: '/contact' },
              ].map(item => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  className="text-aing-muted hover:text-aing-white text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-aing-white">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:gachon.aing@gmail.com"
                className="flex items-center gap-2 text-aing-muted hover:text-aing-white text-sm transition-colors"
              >
                <Mail size={14} />
                gachon.aing@gmail.com
              </a>
              <a
                href="https://github.com/aing-gachon"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-aing-muted hover:text-aing-white text-sm transition-colors"
              >
                <Github size={14} />
                aing-gachon
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-aing-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-aing-muted text-xs">
            © 2026 A.ing. Licensed under CC BY-NC-SA 4.0.
          </p>
          <p className="text-aing-muted text-xs font-mono">
            Undergraduate-led AI Academic Society
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
