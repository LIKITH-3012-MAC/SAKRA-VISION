import React, { useEffect } from 'react';

export default function SEO() {
  useEffect(() => {
    // 1. Title
    document.title = "SAKRA VISION | AI Product Studio Established in 2026 by Likith Naidu Anumakonda";

    // 2. Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    // Set to current URL dynamically
    canonical.setAttribute('href', window.location.href);

    // 3. Meta tags
    const metaTags = {
      description: "SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda. We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies. Our goal is simple: convert powerful ideas into useful, deployable, secure, and scalable real-world products.",
      keywords: "SAKRA VISION, Sakra Vision AI, SAKRA VISION company, SAKRA VISION AI product studio, Likith Naidu Anumakonda, Likith Naidu, SAKRA VISION founder, AI product studio India, AI innovation company, AI ML company, artificial intelligence company, machine learning products, computer vision systems, LLM tools, RAG systems, AI agents, automation tools, full-stack AI products, civic tech AI, Resolvit AI, SAKRA VISION Event Hub, Bench AI, Prometheus AI, AquaSentinel AI, AI Resume Builder, OpenCV Automation Tools, FastAPI, React, Python, Groq API, Aiven Cloud, Resend API, Cloudflare, AI startup India",
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
      { property: 'og:title', content: 'SAKRA VISION | AI Product Studio Established in 2026 by Likith Naidu Anumakonda' },
      { property: 'og:description', content: 'SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda. We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies.' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:title', content: 'SAKRA VISION | From Ideas to Intelligent Systems' },
      { name: 'twitter:description', content: 'SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda, building AI applications, computer vision, LLMs, RAG, automation, AI agents, and full-stack web products.' }
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
