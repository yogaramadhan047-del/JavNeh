"use client";

import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";
import { Loader2, Save, RefreshCw, BadgeDollarSign, CheckCircle, XCircle } from "lucide-react";
import { AdvertisementSettings } from "@/types/advertisement";
import { getAdSettings, saveAdSettings, DEFAULT_AD_SETTINGS } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import { revalidateSettings } from "@/app/actions/revalidate";

export default function AdminAdvertisementPage() {
  const [settings, setSettings] = useState<AdvertisementSettings>(DEFAULT_AD_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<AdvertisementSettings>(DEFAULT_AD_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const data = await getAdSettings("advertisement");
        if (isMounted) {
          setSettings(data);
          setInitialSettings(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading advertisement settings:", error);
        if (isMounted) {
          showToast("Gagal memuat pengaturan iklan", "error");
          setLoading(false);
        }
      }
    };

    loadSettings();

    const channel = supabase
      .channel("admin-ad-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advertisements" },
        () => {
          getAdSettings("advertisement").then((data) => {
            if (isMounted) {
              setSettings(data);
              setInitialSettings(data);
            }
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          getAdSettings("advertisement").then((data) => {
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
      const { success, error } = await saveAdSettings(settings, "advertisement");
      if (!success) {
        throw new Error(error || "Gagal menyimpan pengaturan iklan");
      }

      await revalidateSettings();
      setInitialSettings(settings);
      showToast("Pengaturan iklan berhasil disimpan", "success");
    } catch (error: unknown) {
      console.error("Error saving advertisement settings:", error);
      const msg = error instanceof Error ? error.message : "Gagal menyimpan pengaturan iklan";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Advertisement Settings" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BadgeDollarSign className="w-8 h-8 text-primary-blue" />
            Advertisement Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage global ad scripts, direct links, and banner placements.</p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={() => setSettings(initialSettings)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-dark border border-border-dark text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
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
        {/* Global Controls */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">Global Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl border border-border-dark">
              <div>
                <p className="font-medium text-white">Enable Advertisements</p>
                <p className="text-sm text-gray-400">Master switch to turn all ads on/off across the site.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="adsEnabled"
                  checked={settings.adsEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl border border-border-dark">
              <div>
                <p className="font-medium text-white">Test Mode</p>
                <p className="text-sm text-gray-400">Show placeholder banners instead of live ad scripts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="testMode"
                  checked={settings.testMode}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Global Scripts */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">Global Scripts (Adsterra)</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Popunder Script Code</label>
              <textarea
                name="popunderScript"
                value={settings.popunderScript}
                onChange={handleChange}
                rows={3}
                placeholder="<!-- Paste Popunder script here -->"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Social Bar Script Code</label>
              <textarea
                name="socialBarScript"
                value={settings.socialBarScript}
                onChange={handleChange}
                rows={3}
                placeholder="<!-- Paste Social Bar script here -->"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">In-Page Push Script Code</label>
              <textarea
                name="inPagePushScript"
                value={settings.inPagePushScript}
                onChange={handleChange}
                rows={3}
                placeholder="<!-- Paste In-Page Push script here -->"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>
          </div>
        </div>

        {/* Direct Link */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">Smartlink / Direct Link</h2>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Smartlink URL</label>
            <input
              type="url"
              name="smartlinkUrl"
              value={settings.smartlinkUrl}
              onChange={handleChange}
              placeholder="https://example.com/smartlink"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-blue outline-none"
            />
          </div>
        </div>

        {/* Banner Placements */}
        <div className="bg-card-dark border border-border-dark p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-border-dark pb-4">Banner Placements (HTML / Script)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Header Banner 1 (728x90)</label>
              <textarea
                name="headerBanner1"
                value={settings.headerBanner1}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Header Banner 2 (468x60 / 300x250)</label>
              <textarea
                name="headerBanner2"
                value={settings.headerBanner2}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Sidebar Banner (160x600 / 300x250)</label>
              <textarea
                name="sidebarBanner"
                value={settings.sidebarBanner}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Article Content Banner</label>
              <textarea
                name="articleBanner"
                value={settings.articleBanner}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Movie Detail Banner</label>
              <textarea
                name="movieDetailBanner"
                value={settings.movieDetailBanner}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Footer Banner 1</label>
              <textarea
                name="footerBanner1"
                value={settings.footerBanner1}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Footer Banner 2</label>
              <textarea
                name="footerBanner2"
                value={settings.footerBanner2}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:ring-2 focus:ring-primary-blue outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
