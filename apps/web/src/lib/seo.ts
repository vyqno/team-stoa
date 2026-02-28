import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  twitterCard?: "summary" | "summary_large_image";
}

function setMetaTag(property: string, content: string, attr: "name" | "property" = "property") {
  let element = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    document.title = config.title;

    if (config.description) {
      setMetaTag("description", config.description, "name");
    }

    setMetaTag("og:title", config.ogTitle || config.title);
    if (config.description || config.ogDescription) {
      setMetaTag("og:description", config.ogDescription || config.description || "");
    }
    if (config.ogImage) {
      setMetaTag("og:image", config.ogImage);
    }
    if (config.ogUrl) {
      setMetaTag("og:url", config.ogUrl);
    }

    setMetaTag("twitter:card", config.twitterCard || "summary_large_image", "name");
    setMetaTag("twitter:title", config.ogTitle || config.title, "name");
    if (config.description || config.ogDescription) {
      setMetaTag("twitter:description", config.ogDescription || config.description || "", "name");
    }

    if (config.canonical) {
      setCanonical(config.canonical);
    }
  }, [config.title, config.description, config.ogTitle, config.ogDescription, config.ogImage, config.ogUrl, config.canonical, config.twitterCard]);
}
