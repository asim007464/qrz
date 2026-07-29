export type SiteCopyMap = Record<string, string>;

export type SiteCopyField = {
  key: string;
  label: string;
  multiline?: boolean;
};

export type SiteCopySection = {
  id: string;
  label: string;
  description?: string;
  fields: SiteCopyField[];
};

/** Editable website copy grouped by page/section for the admin editor. */
export const SITE_COPY_SECTIONS: SiteCopySection[] = [
  {
    id: "global",
    label: "Global / Brand",
    description: "Appears in the sidebar and shared chrome.",
    fields: [
      { key: "global.brand_tagline", label: "Sidebar tagline" },
      { key: "global.site_name", label: "Site name" },
    ],
  },
  {
    id: "home",
    label: "Home",
    fields: [
      { key: "home.welcome_eyebrow", label: "Welcome eyebrow" },
      { key: "home.welcome_title", label: "Welcome title" },
      { key: "home.welcome_body", label: "Welcome body", multiline: true },
      { key: "home.sign_in_cta", label: "Sign in button" },
      { key: "home.register_cta", label: "Register button" },
      { key: "home.feed_heading", label: "CQ Feed heading" },
      { key: "home.make_post_link", label: "Make Post link" },
      { key: "home.see_all_link", label: "See All link" },
      { key: "home.empty_feed", label: "Empty feed text" },
      { key: "home.be_first_link", label: "Be the first link text" },
      { key: "home.open_full_feed", label: "Open full feed text" },
      { key: "home.see_all_posts", label: "See all posts text" },
      { key: "home.event_eyebrow", label: "Event eyebrow" },
      { key: "home.event_title", label: "Event title" },
      { key: "home.event_body", label: "Event body", multiline: true },
      { key: "home.event_cta", label: "Event button" },
      { key: "home.ai_eyebrow", label: "AI assistant eyebrow" },
      { key: "home.ai_body", label: "AI assistant body", multiline: true },
      { key: "home.ai_hint", label: "AI assistant hint" },
      { key: "home.ai_cta", label: "AI assistant button" },
      { key: "home.download_eyebrow", label: "Download card eyebrow" },
      { key: "home.download_title", label: "Download card title" },
      { key: "home.download_body", label: "Download card body", multiline: true },
      { key: "home.download_footer", label: "Download card footer", multiline: true },
      { key: "home.download_android_cta", label: "Download Android button" },
      { key: "home.download_ios_cta", label: "Download iOS button" },
    ],
  },
  {
    id: "feed",
    label: "CQ Feed page",
    fields: [
      { key: "feed.title", label: "Page title" },
      { key: "feed.subtitle", label: "Subtitle" },
      { key: "feed.description", label: "Description", multiline: true },
      { key: "feed.make_post_cta", label: "Make Post button" },
      { key: "feed.empty", label: "Empty state", multiline: true },
    ],
  },
  {
    id: "login",
    label: "Login",
    fields: [
      { key: "login.title", label: "Page title" },
      { key: "login.subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    id: "register",
    label: "Register",
    fields: [
      { key: "register.title", label: "Create account title" },
      { key: "register.subtitle", label: "Create account subtitle", multiline: true },
      { key: "register.welcome_title", label: "Post-register welcome title" },
      { key: "register.verify_title", label: "Verify email title" },
      { key: "register.submit_cta", label: "Create account button" },
    ],
  },
  {
    id: "download",
    label: "Download App",
    fields: [
      { key: "download.title", label: "Page title" },
      { key: "download.eyebrow", label: "Hero eyebrow" },
      { key: "download.headline", label: "Hero headline" },
      { key: "download.body", label: "Hero body", multiline: true },
      { key: "download.android_title", label: "Android title" },
      { key: "download.android_subtitle", label: "Android subtitle" },
      { key: "download.android_body", label: "Android body", multiline: true },
      { key: "download.android_install_cta", label: "Android install button" },
      { key: "download.android_cta", label: "Android APK button" },
      { key: "download.ios_title", label: "iOS title" },
      { key: "download.ios_subtitle", label: "iOS subtitle" },
      { key: "download.ios_body", label: "iOS body", multiline: true },
      { key: "download.ios_install_cta", label: "iOS install button" },
      { key: "download.ios_cta", label: "iOS IPA button" },
      { key: "download.home_screen_title", label: "Home screen title" },
      { key: "download.home_screen_body", label: "Home screen body", multiline: true },
    ],
  },
  {
    id: "contact",
    label: "Help & Support",
    fields: [
      { key: "contact.title", label: "Page title" },
      { key: "contact.subtitle", label: "Subtitle", multiline: true },
      { key: "contact.sent_title", label: "Success title" },
      { key: "contact.sent_body", label: "Success body", multiline: true },
      { key: "contact.send_another", label: "Send another button" },
    ],
  },
  {
    id: "add_post",
    label: "Make Post",
    fields: [
      { key: "add_post.title", label: "Page title" },
      { key: "add_post.textarea_label", label: "Textarea label" },
      { key: "add_post.placeholder", label: "Textarea placeholder", multiline: true },
      { key: "add_post.add_photo", label: "Add photo button" },
      { key: "add_post.publish_cta", label: "Publish button" },
    ],
  },
];

export const DEFAULT_SITE_COPY: SiteCopyMap = {
  "global.brand_tagline": "QRZ Social Network",
  "global.site_name": "QRZ",

  "home.welcome_eyebrow": "Welcome to QRZ",
  "home.welcome_title": "QRZ Social Network",
  "home.welcome_body":
    "Browse the feed, then sign in or register to send QSL cards, connect with operators, and manage your profile.",
  "home.sign_in_cta": "Sign In",
  "home.register_cta": "Register Free",
  "home.feed_heading": "CQ Feed",
  "home.make_post_link": "Make Post",
  "home.see_all_link": "See All",
  "home.empty_feed": "No posts yet.",
  "home.be_first_link": "Be the first to post",
  "home.open_full_feed": "Open full CQ Feed",
  "home.see_all_posts": "See all posts from operators",
  "home.event_eyebrow": "Upcoming Event",
  "home.event_title": "QRZ INDIA 2024",
  "home.event_body":
    "Join operators from across the country for workshops, demos, and DX sessions.",
  "home.event_cta": "View Details",
  "home.ai_eyebrow": "AI Assistant",
  "home.ai_body": "Ask anything about QRZ, DX, propagation, equipment, and more.",
  "home.ai_hint": "Beta UI · no real AI backend yet",
  "home.ai_cta": "Ask Now",
  "home.download_eyebrow": "Download the app",
  "home.download_title": "QRZ for iOS & Android",
  "home.download_body":
    "Upload your profile, share QSL cards, build connections, and track views/searches.",
  "home.download_footer":
    "Get QRZ on your phone with the official app icon on your home screen.",
  "home.download_android_cta": "Download Android",
  "home.download_ios_cta": "Download iOS",

  "feed.title": "CQ Feed",
  "feed.subtitle": "Posts from operators worldwide",
  "feed.description":
    "Read the latest CQ calls, DX reports, and field updates — then add your own.",
  "feed.make_post_cta": "Make Post",
  "feed.empty": "No posts yet. Be the first on the CQ Feed.",

  "login.title": "Sign In To QRZ",
  "login.subtitle": "Sign in to access the QRZ social network. New users must register first.",

  "register.title": "Create Your Account",
  "register.subtitle": "Join the QRZ social network",
  "register.welcome_title": "Welcome to QRZ!",
  "register.verify_title": "Verify Your Email",
  "register.submit_cta": "Create account",

  "download.title": "Download the App",
  "download.eyebrow": "QRZ Mobile",
  "download.headline": "Upload, share, connect, and manage your QSLs",
  "download.body": "Install QRZ on your phone to access the QRZ social network on the go.",
  "download.android_title": "Android",
  "download.android_subtitle": "QRZ for Android",
  "download.android_body":
    "Tap Download APK, then open the file on your Android phone to install QRZ.",
  "download.android_install_cta": "Install QRZ App",
  "download.android_cta": "Download APK",
  "download.ios_title": "iPhone (iOS)",
  "download.ios_subtitle": "QRZ for iOS",
  "download.ios_body":
    "iPhone uses Add to Home Screen (Safari). A separate IPA store build is not available yet.",
  "download.ios_install_cta": "Add to Home Screen",
  "download.ios_cta": "Download iOS",
  "download.home_screen_title": "App icon on your home screen",
  "download.home_screen_body":
    "After installing, the QRZ icon appears on your device like any other app.",

  "contact.title": "Contact QRZ",
  "contact.subtitle": "Send us a message and we will get back to you as soon as we can.",
  "contact.sent_title": "Message sent",
  "contact.sent_body": "Thanks for reaching out. We will get back to you as soon as we can.",
  "contact.send_another": "Send another message",

  "add_post.title": "Make Post",
  "add_post.textarea_label": "What's on the air? (optional if you add a photo)",
  "add_post.placeholder":
    "Share a CQ call, DX report, field day update… or leave blank for a photo-only post",
  "add_post.add_photo": "Add photo (optional if you write text)",
  "add_post.publish_cta": "Publish to CQ Feed",
};

export function mergeSiteCopy(stored?: SiteCopyMap | null): SiteCopyMap {
  return { ...DEFAULT_SITE_COPY, ...(stored || {}) };
}

export function siteCopyText(copy: SiteCopyMap, key: string): string {
  const value = copy[key];
  if (typeof value === "string" && value.trim()) return value;
  return DEFAULT_SITE_COPY[key] ?? "";
}

export function allSiteCopyKeys(): string[] {
  return SITE_COPY_SECTIONS.flatMap((section) => section.fields.map((f) => f.key));
}
