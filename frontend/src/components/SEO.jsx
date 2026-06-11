import React, { useEffect } from 'react';

export default function SEO() {
  useEffect(() => {
    // 1. Title
    document.title = "SAKRA VISION | AI Product Studio Founded by Likith Naidu Anumakonda";

    // 2. Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sakra-vision.online/');

    // 3. Meta tags
    const metaTags = {
      description: "SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda. The company builds real-world intelligent systems using AI/ML, computer vision, LLMs, RAG, AI agents, automation, and full-stack web technologies.",
      keywords: "SAKRA VISION, Sakra Vision AI, SAKRA VISION company, Likith Naidu Anumakonda, AI product studio India, AI innovation company, AI ML company, computer vision systems, LLM tools, RAG systems, AI agents, automation tools, full-stack AI products, civic tech AI, Resolvit AI, SAKRA VISION Event Hub, Bench AI, Prometheus AI, AquaSentinel AI",
      author: "Likith Naidu Anumakonda"
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // 4. Open Graph & Twitter Social Tags
    const socialTags = [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'SAKRA VISION' },
      { property: 'og:title', content: 'SAKRA VISION | AI Product Studio Founded by Likith Naidu Anumakonda' },
      { property: 'og:description', content: 'SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda, building AI applications, LLM/RAG tools, computer vision systems, automation platforms, and full-stack intelligent products.' },
      { property: 'og:url', content: 'https://sakra-vision.online/' },
      { property: 'og:image', content: 'https://sakra-vision.online/SAKRAVISION.png' },
      { property: 'og:image:alt', content: 'SAKRA VISION AI Product Studio Logo' },
      { property: 'og:locale', content: 'en_IN' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SAKRA VISION | From Ideas to Intelligent Systems' },
      { name: 'twitter:description', content: 'SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda, building AI applications, LLM/RAG tools, computer vision systems, automation platforms, and full-stack intelligent products.' },
      { name: 'twitter:image', content: 'https://sakra-vision.online/SAKRAVISION.png' },
      { name: 'twitter:image:alt', content: 'SAKRA VISION Logo' }
    ];

    socialTags.forEach((tag) => {
      const selector = tag.property 
        ? `meta[property="${tag.property}"]` 
        : `meta[name="${tag.name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.property) meta.setAttribute('property', tag.property);
        if (tag.name) meta.setAttribute('name', tag.name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });
  }, []);

  return null; // Side-effect component
}
