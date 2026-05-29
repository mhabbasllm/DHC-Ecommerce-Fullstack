import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  ChevronDown
} from 'lucide-react';
import logo from '../../assets/Layout/Brand/logo-colored.png';
import groupSocial from '../../assets/Layout/Misc/Group.png';
import marketBtn from '../../assets/Layout/Misc/market-button.png';
import flagUS from '../../assets/Layout1/Image/flags/US@2x.png';

const Footer = () => {
  const footerSections = [
    {
      title: 'About',
      links: ['About Us', 'Find store', 'Categories', 'Blogs']
    },
    {
      title: 'Partnership',
      links: ['About Us', 'Find store', 'Categories', 'Blogs']
    },
    {
      title: 'Information',
      links: ['Help Center', 'Money Refund', 'Shipping', 'Contact us']
    },
    {
      title: 'For users',
      links: ['Login', 'Register', 'Settings', 'My Orders']
    }
  ];

  return (
    <footer className="bg-white px-4 py-8 md:px-0 md:py-12">
      <div className="container px-4">
        {/* Desktop: 6 column grid | Mobile: stacked */}
        <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1.5fr] gap-8 mb-16">
          <div>
            <div className="flex items-center mb-5">
              <img src={logo} alt="Logo" className="h-10" />
            </div>
            <p className="text-brand-gray text-sm mb-5 leading-relaxed max-w-[260px]">
              Best information about the company gies here but now lorem ipsum is
            </p>
            <div className="flex gap-2.5 items-center">
              {[<Facebook />,<Twitter />,<Linkedin />,<Instagram />,<Youtube />].map((icon, idx) => (
                <span key={idx} className="w-8 h-8 bg-[#bdc3c7] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-blue transition-colors">
                  {React.cloneElement(icon, { size: 16 })}
                </span>
              ))}
            </div>
          </div>
          
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-bold mb-5 text-base text-brand-dark">{section.title}</h4>
              <ul className="space-y-2.5 text-brand-gray text-sm">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx} className="hover:text-brand-blue cursor-pointer transition-colors">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-bold mb-5 text-base text-brand-dark">Get app</h4>
            <div className="flex flex-col gap-2.5">
              <img src={marketBtn} alt="App Store" className="h-10 w-fit cursor-pointer object-contain" />
              <img src={groupSocial} alt="Google Play" className="h-10 w-fit cursor-pointer object-contain" />
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden">
          {/* Logo & description */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <img src={logo} alt="Logo" className="h-8" />
            </div>
            <p className="max-w-[280px] text-xs leading-relaxed text-brand-gray">
              Best information about the company gies here but now lorem ipsum is
            </p>
            <div className="flex gap-2 items-center mt-3">
              {[<Facebook />,<Twitter />,<Linkedin />,<Instagram />,<Youtube />].map((icon, idx) => (
                <span key={idx} className="w-7 h-7 bg-[#bdc3c7] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-blue transition-colors">
                  {React.cloneElement(icon, { size: 14 })}
                </span>
              ))}
            </div>
          </div>

          {/* Link sections - 2 column grid on mobile */}
          <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-6">
            {footerSections.map((section, idx) => (
              <div key={idx} className="min-w-0">
                <h4 className="font-bold mb-3 text-sm text-brand-dark">{section.title}</h4>
                <ul className="space-y-2 text-brand-gray text-xs">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="truncate hover:text-brand-blue cursor-pointer transition-colors">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Get app */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 text-sm text-brand-dark">Get app</h4>
            <div className="flex flex-wrap gap-2">
              <img src={marketBtn} alt="App Store" className="h-9 max-w-[140px] cursor-pointer object-contain" />
              <img src={groupSocial} alt="Google Play" className="h-9 max-w-[140px] cursor-pointer object-contain" />
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-brand-gray text-xs md:text-sm">
          <p>© 2023 Ecommerce.</p>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-brand-dark transition-colors">
            <img src={flagUS} alt="Lang" className="w-5 object-contain" />
            English <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
