import { Github, Linkedin, Instagram, X } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white dark:bg-gradient-to-r dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand and tagline */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <a href="https://barbelltobinary.netlify.app/" target="_blank" className="text-2xl font-serif font-bold gradient-text transition duration-200 hover:text-blue-300 focus:text-blue-300" style={{textShadow: '0 2px 8px rgba(80,80,255,0.08)'}}>
              BarbellToBinary
            </a>
            <p className="text-gray-400 text-sm mt-2 dark:text-gray-300">
              Smarter study, powered by AI. Doubt solving, resources, and productivity—one dashboard.
            </p>
          </div>

          {/* Divider for mobile */}
          <div className="block md:hidden w-full my-4 border-t border-white/10 dark:border-gray-800"></div>

          {/* Social icons */}
          <div className="flex gap-4 mb-6 md:mb-0">
            <a
              href="https://github.com/singhHariom1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-accent/20 hover:scale-110 transform transition-transform duration-200"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/hariom-singh6199/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-accent/20 hover:scale-110 transform transition-transform duration-200"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/BarbellToBinary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-accent/20 hover:scale-110 transform transition-transform duration-200"
              title="X"
            >
              <X className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/stoic.liftss/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-accent/20 hover:scale-110 transform transition-transform duration-200"
              title="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 dark:border-gray-800 flex flex-col items-center">
          <p className="text-sm text-gray-400 mb-1 dark:text-gray-300">
            Designed and developed by Hariom Singh
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {currentYear} BarbellToBinary. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 