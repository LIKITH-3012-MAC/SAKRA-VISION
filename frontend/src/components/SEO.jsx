import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "SAKRA VISION | AI Product Studio in India — AI, LLM & Automation",
  description = "SAKRA VISION is an AI product studio in India founded by Likith Naidu Anumakonda. We build AI applications, computer vision systems, LLM/RAG tools and intelligent automation products.",
  keywords = "Sakra Vision AI Product Studio, Sakra Vision by Likith Naidu, Sakra Vision Online, Sakra Vision AI Automation, Sakra Vision Web Development, Sakra Vision Event Tech, Sakra Vision Cloud Software, AI product studio India, AI innovation company",
  canonical = "https://www.sakra-vision.online/",
  ogType = "website",
  image = "https://www.sakra-vision.online/sakra-vision-ai-product-studio-logo.png"
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Likith Naidu Anumakonda" />
      <link rel="canonical" href={canonical} />
      <link rel="apple-touch-icon" href="/SAKRAVISION.png" />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="SAKRA VISION" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1536" />
      <meta property="og:image:height" content="1024" />
      <meta property="og:image:alt" content="Official SAKRA VISION logo — AI Product Studio" />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="Official SAKRA VISION logo — AI Product Studio" />

      <meta name="robots" content="index, follow, max-image-preview:large" />
    </Helmet>
  );
}
