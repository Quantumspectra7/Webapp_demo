"use client";

import React, { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export const triggerGoogleTranslate = (lang: "EN" | "PA" | "HI") => {
  if (typeof window === "undefined") return;
  const langCode = lang === "EN" ? "en" : lang === "PA" ? "pa" : "hi";

  // Set cookies for Google Translate (both session and permanent 1-year)
  const d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();

  document.cookie = `googtrans=/en/${langCode}; ${expires}; path=/`;
  document.cookie = `googtrans=/en/${langCode}; ${expires}; path=/; domain=${window.location.hostname}`;
  if (window.location.hostname !== "localhost") {
    document.cookie = `googtrans=/en/${langCode}; ${expires}; path=/; domain=.${window.location.hostname}`;
  }

  // Trigger Google's combo dropdown if loaded
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    select.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    // If combo not in DOM yet, reload so the cookie translates on render
    window.location.reload();
  }
};

export const GoogleTranslate: React.FC = () => {
  useEffect(() => {
    // 1. Define global callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,pa,hi",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // 2. Load script if not already present
    const existing = document.getElementById("google-translate-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    // 3. Continuously suppress Google Translate top banner iframe and keep body at top: 0
    const cleanupBanner = () => {
      if (document.body && document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }
      const banners = document.querySelectorAll(
        'iframe.goog-te-banner-frame, .goog-te-banner-frame, iframe[id*=":1.container"], iframe[id*=":2.container"], .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-aZ2wEe-OiiCO'
      );
      banners.forEach((b) => {
        const el = b as HTMLElement;
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("height", "0px", "important");
      });
    };

    const interval = setInterval(cleanupBanner, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: "fixed",
        top: "-1000px",
        left: "-1000px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -9999,
      }}
    />
  );
};
