"use client";

import { Language, SiteAssetSection } from "@trends172tech/db";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableSiteAsset = {
  id: string;
  section: SiteAssetSection;
  language: Language;
  eyebrow: string | null;
  badge: string | null;
  title: string;
  body: string;
  imageUrl: string;
  blobUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  highlights: string[];
  sortOrder: number;
  isActive: boolean;
};

type SectionConfig = {
  title: string;
  description: string;
  addLabel: string;
};

const sectionConfig: Record<SiteAssetSection, SectionConfig> = {
  HOME_HERO: {
    title: "Hero principal",
    description: "Slides de apertura de la home en formato full-screen. Usa imagenes reales y de alta calidad para que el hero venda el producto desde el primer scroll.",
    addLabel: "Nuevo slide"
  },
  HOME_SHOWCASE: {
    title: "Bloques de apoyo",
    description: "Tarjetas visuales debajo del hero para sistemas, agentes, casos y otras lineas de venta.",
    addLabel: "Nueva tarjeta"
  }
};

const languageLabels: Record<Language, string> = {
  ES: "Espanol",
  EN: "English"
};

function createDraft(section: SiteAssetSection, language: Language, sortOrder: number): EditableSiteAsset {
  return {
    id: `draft-${section}-${language}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    language,
    eyebrow: "",
    badge: "",
    title: "",
    body: "",
    imageUrl: "",
    blobUrl: "",
    ctaLabel: "",
    ctaHref: "",
    highlights: [],
    sortOrder,
    isActive: true
  };
}

function isDraft(id: string) {
  return id.startsWith("draft-");
}

export function SiteMediaClient({
  initialAssets
}: {
  initialAssets: EditableSiteAsset[];
}) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [isReloading, setIsReloading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaClassName =
    "interactive-field min-h-28 w-full rounded-[22px] border border-slate-200 bg-white/96 px-4 py-3 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none ring-0 transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  const groupedAssets = useMemo(() => {
    return assets.reduce<Record<SiteAssetSection, Record<Language, EditableSiteAsset[]>>>(
      (acc, asset) => {
        acc[asset.section][asset.language].push(asset);
        acc[asset.section][asset.language].sort((a, b) => a.sortOrder - b.sortOrder);
        return acc;
      },
      {
        HOME_HERO: { ES: [], EN: [] },
        HOME_SHOWCASE: { ES: [], EN: [] }
      }
    );
  }, [assets]);

  async function reloadAssets() {
    setIsReloading(true);
    try {
      const response = await fetch("/api/site-assets", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: EditableSiteAsset[];
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "No se pudo recargar la media del sitio.");
      }

      setAssets(payload.data);
      router.refresh();
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "No se pudo recargar.");
    } finally {
      setIsReloading(false);
    }
  }

  function updateAsset(id: string, patch: Partial<EditableSiteAsset>) {
    setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)));
  }

  function addAsset(section: SiteAssetSection, language: Language) {
    const current = groupedAssets[section][language];
    const nextSortOrder =
      current.length === 0 ? 0 : Math.max(...current.map((asset) => asset.sortOrder)) + 1;

    setAssets((existing) => [...existing, createDraft(section, language, nextSortOrder)]);
    setMessage(null);
    setError(null);
  }

  async function uploadImage(asset: EditableSiteAsset, file: File) {
    setMessage(null);
    setError(null);
    setUploadingId(asset.id);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", asset.section);
      formData.append("language", asset.language);

      const response = await fetch("/api/site-assets/upload", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { url: string; pathname: string };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "No se pudo subir la imagen.");
      }

      updateAsset(asset.id, {
        imageUrl: payload.data.url,
        blobUrl: payload.data.url
      });
      setMessage("Imagen subida. Guarda la tarjeta para publicar el cambio.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingId(null);
    }
  }

  async function saveAsset(asset: EditableSiteAsset) {
    setMessage(null);
    setError(null);

    if (!asset.title.trim()) {
      setError("Cada pieza necesita un titulo.");
      return;
    }
    if (!asset.body.trim()) {
      setError("Cada pieza necesita una descripcion.");
      return;
    }
    if (!asset.imageUrl.trim()) {
      setError("Debes subir o pegar una imagen antes de guardar.");
      return;
    }

    setSavingId(asset.id);

    try {
      const response = await fetch("/api/site-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isDraft(asset.id) ? undefined : asset.id,
          section: asset.section,
          language: asset.language,
          eyebrow: asset.eyebrow ?? "",
          badge: asset.badge ?? "",
          title: asset.title,
          body: asset.body,
          imageUrl: asset.imageUrl,
          blobUrl: asset.blobUrl ?? "",
          ctaLabel: asset.ctaLabel ?? "",
          ctaHref: asset.ctaHref ?? "",
          highlights: asset.highlights.filter((item) => item.trim().length > 0),
          sortOrder: asset.sortOrder,
          isActive: asset.isActive
        })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar la pieza.");
      }

      setMessage("Cambios guardados.");
      await reloadAssets();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteAsset(asset: EditableSiteAsset) {
    setMessage(null);
    setError(null);

    if (isDraft(asset.id)) {
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      return;
    }

    const confirmed = window.confirm(`Eliminar "${asset.title}" del sitio?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(asset.id);

    try {
      const response = await fetch(`/api/site-assets?id=${asset.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar la pieza.");
      }

      setMessage("Pieza eliminada.");
      await reloadAssets();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Content operations</p>
          <CardTitle>Centro visual del sitio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Desde aqui puedes controlar el hero principal y los bloques visuales de la home. Si no
            guardas piezas personalizadas, el sitio sigue usando el contenido por defecto del codigo.
          </p>
          <div className="interactive-panel rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Recomendacion para el hero: imagenes reales en horizontal, minimo 1920x1080, poco
            texto incrustado en la foto y buen contraste para titulares sobre la imagen.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void reloadAssets()} disabled={isReloading}>
              {isReloading ? "Recargando..." : "Recargar contenido"}
            </Button>
          </div>
          {message ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {(Object.keys(sectionConfig) as SiteAssetSection[]).map((section) => (
        <section key={section} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {sectionConfig[section].title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sectionConfig[section].description}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {(Object.keys(languageLabels) as Language[]).map((language) => (
              <Card key={`${section}-${language}`} className="interactive-panel overflow-hidden">
                <CardHeader className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{languageLabels[language]}</CardTitle>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {groupedAssets[section][language].length} pieza(s) configuradas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addAsset(section, language)}
                    >
                      {sectionConfig[section].addLabel}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  {groupedAssets[section][language].length === 0 ? (
                    <div className="interactive-panel rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Aun no hay piezas personalizadas en {languageLabels[language]} para esta
                      seccion.
                    </div>
                  ) : null}

                  {groupedAssets[section][language].map((asset) => (
                    <article
                      key={asset.id}
                      className="interactive-panel space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {asset.title.trim() || "Pieza sin titulo"}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <label className="inline-flex items-center gap-2">
                            <span>Activa</span>
                            <input
                              type="checkbox"
                              checked={asset.isActive}
                              onChange={(event) =>
                                updateAsset(asset.id, { isActive: event.target.checked })
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                            />
                          </label>
                          <Label htmlFor={`sortOrder-${asset.id}`}>Orden</Label>
                          <Input
                            id={`sortOrder-${asset.id}`}
                            className="w-20"
                            value={asset.sortOrder}
                            onChange={(event) =>
                              updateAsset(asset.id, {
                                sortOrder: Number.parseInt(event.target.value || "0", 10) || 0
                              })
                            }
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                          {asset.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.imageUrl}
                              alt={asset.title || "Preview"}
                              className="h-56 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-56 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                              Sin imagen cargada
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <label className="interactive-chip inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200">
                            {uploadingId === asset.id ? "Subiendo..." : "Subir imagen"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  void uploadImage(asset, file);
                                  event.target.value = "";
                                }
                              }}
                            />
                          </label>
                          <div className="flex-1">
                            <Label htmlFor={`imageUrl-${asset.id}`}>URL de imagen</Label>
                            <Input
                              id={`imageUrl-${asset.id}`}
                              value={asset.imageUrl}
                              onChange={(event) =>
                                updateAsset(asset.id, { imageUrl: event.target.value })
                              }
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`eyebrow-${asset.id}`}>Eyebrow</Label>
                          <Input
                            id={`eyebrow-${asset.id}`}
                            value={asset.eyebrow ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { eyebrow: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`badge-${asset.id}`}>Badge</Label>
                          <Input
                            id={`badge-${asset.id}`}
                            value={asset.badge ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { badge: event.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`title-${asset.id}`}>Titulo</Label>
                        <Input
                          id={`title-${asset.id}`}
                          value={asset.title}
                          onChange={(event) => updateAsset(asset.id, { title: event.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`body-${asset.id}`}>Descripcion</Label>
                        <textarea
                          id={`body-${asset.id}`}
                          value={asset.body}
                          onChange={(event) => updateAsset(asset.id, { body: event.target.value })}
                          rows={4}
                          className={textareaClassName}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`ctaLabel-${asset.id}`}>CTA</Label>
                          <Input
                            id={`ctaLabel-${asset.id}`}
                            value={asset.ctaLabel ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { ctaLabel: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ctaHref-${asset.id}`}>Link del CTA</Label>
                          <Input
                            id={`ctaHref-${asset.id}`}
                            value={asset.ctaHref ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { ctaHref: event.target.value })
                            }
                            placeholder="/es/systems/luna"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`highlights-${asset.id}`}>Highlights (uno por linea)</Label>
                        <textarea
                          id={`highlights-${asset.id}`}
                          value={asset.highlights.join("\n")}
                          onChange={(event) =>
                            updateAsset(asset.id, {
                              highlights: event.target.value
                                .split("\n")
                                .map((item) => item.trim())
                                .filter(Boolean)
                            })
                          }
                          rows={4}
                          className={textareaClassName}
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => void saveAsset(asset)}
                          disabled={savingId === asset.id}
                        >
                          {savingId === asset.id ? "Guardando..." : "Guardar pieza"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void deleteAsset(asset)}
                          disabled={deletingId === asset.id}
                        >
                          {deletingId === asset.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
