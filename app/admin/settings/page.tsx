"use client";

import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Loader2, Save, RefreshCw, CheckCircle, XCircle, Settings as SettingsIcon } from "lucide-react";
import { SiteSettings } from "@/types/settings";
import { FaviconUpload } from "./components/favicon-upload";
import { getSiteSettings, saveSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import { revalidateSettings } from "@/app/actions/revalidate";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const data = await getSiteSettings("general");
        if (isMounted) {
          setSettings(data);
          setInitialSettings(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        if (isMounted) {
          showToast("Gagal memuat pengaturan situs", "error");
          setLoading(false);
        }
      }
    };

    loadSettings();

    // Listen for real-time updates on settings table
    const channel = supabase
      .channel("admin-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          getSiteSettings("general").then((data) => {
            if (isMounted) {
              setSettings(data);
              setInitialSettings(data);
            }
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { success, error } = await saveSiteSettings(settings, "general");

      if (!success) {
        throw new Error(error || "Gagal menyimpan pengaturan");
      }

      await revalidateSettings();
      setInitialSettings(settings);
      showToast("Pengaturan berhasil disimpan", "success");
    } catch (error: unknown) {
      console.error("Error saving settings:", error);
      const msg = error instanceof Error ? error.message : "Gagal menyimpan pengaturan";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);
  const isFormDisabled = saving || uploadingCount > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Site Settings" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary-blue" />
            Site Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage global website configurations, SEO, and tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={() => setSettings(initialSettings)}
              disabled={isFormDisabled}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-dark border border-border-dark text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isFormDisabled || !hasChanges}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary-blue text-white font-medium hover:bg-primary-blue-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        {/* General Settings */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">General Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Site URL</label>
              <input
                type="url"
                name="siteUrl"
                value={settings.siteUrl}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Site Description</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                disabled={isFormDisabled}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <FaviconUpload
                value={settings.faviconUrl || ""}
                onChange={(url) => setSettings((prev) => ({ ...prev, faviconUrl: url }))}
                path="favicon"
                maxSizeMB={2}
                label="Favicon"
                onUploadStart={() => setUploadingCount((c) => c + 1)}
                onUploadEnd={() => setUploadingCount((c) => Math.max(0, c - 1))}
                onError={(msg) => showToast(msg, "error")}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        {/* SEO & Tracking */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">SEO & Tracking</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Google Analytics ID</label>
              <input
                type="text"
                name="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={handleChange}
                disabled={isFormDisabled}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Google Search Console Tag</label>
              <input
                type="text"
                name="googleSearchConsole"
                value={settings.googleSearchConsole}
                onChange={handleChange}
                disabled={isFormDisabled}
                placeholder="content value from meta tag"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Default Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={settings.metaKeywords}
                onChange={handleChange}
                disabled={isFormDisabled}
                placeholder="nonton film, streaming movie, sub indo"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border-dark pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Announcement Banner</h2>
              <p className="text-sm text-gray-400 mt-0.5">Show a top announcement bar across the website.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="bannerActive"
                checked={settings.bannerActive}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Banner Message</label>
            <textarea
              name="bannerText"
              value={settings.bannerText}
              onChange={handleChange}
              disabled={isFormDisabled}
              rows={2}
              placeholder="e.g. Website sedang dalam pemeliharaan server ringan atau pengumuman penting..."
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none text-sm"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
