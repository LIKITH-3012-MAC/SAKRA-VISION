import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Sakra Vision AI Product Studio | AI Automation & Web Apps by Likith Naidu",
  description = "Sakra Vision is an AI product studio founded by Likith Naidu Anumakonda, building AI automation tools, event registration systems, web applications, and cloud software solutions.",
  keywords = "Sakra Vision AI Product Studio, Sakra Vision by Likith Naidu, Sakra Vision Online, Sakra Vision AI Automation, Sakra Vision Web Development, Sakra Vision Event Tech, Sakra Vision Cloud Software, AI product studio India, AI innovation company",
  canonical = "https://www.sakra-vision.online/",
  ogType = "website"
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Likith Naidu Anumakonda" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Sakra Vision AI Product Studio" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content="https://www.sakra-vision.online/SAKRAVISION.png" />
      <meta property="og:image:alt" content="Sakra Vision AI Product Studio Logo" />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.sakra-vision.online/SAKRAVISION.png" />
      <meta name="twitter:image:alt" content="Sakra Vision AI Product Studio Logo" />

      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
