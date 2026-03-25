"use client";

import { Language, SiteAssetSection } from "@trends172tech/db";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
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
  const locale = useLocale();
  const isEs = locale.startsWith("es");
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

  const uiCopy = isEs
    ? {
        operations: "Operaciones de contenido",
        visualCenter: "Centro visual del sitio",
        intro:
          "Desde aqui puedes controlar el hero principal y los bloques visuales de la home. Si no guardas piezas personalizadas, el sitio sigue usando el contenido por defecto del codigo.",
        recommendation:
          "Recomendacion para el hero: imagenes reales en horizontal, minimo 1920x1080, poco texto incrustado en la foto y buen contraste para titulares sobre la imagen.",
        reload: "Recargar contenido",
        reloading: "Recargando...",
        reloadError: "No se pudo recargar la media del sitio.",
        reloadGeneric: "No se pudo recargar.",
        uploadError: "No se pudo subir la imagen.",
        uploadSuccess: "Imagen subida. Guarda la tarjeta para publicar el cambio.",
        titleRequired: "Cada pieza necesita un titulo.",
        bodyRequired: "Cada pieza necesita una descripcion.",
        imageRequired: "Debes subir o pegar una imagen antes de guardar.",
        saveError: "No se pudo guardar la pieza.",
        saveGeneric: "No se pudo guardar.",
        saveSuccess: "Cambios guardados.",
        deleteConfirm: 'Eliminar "{title}" del sitio?',
        deleteError: "No se pudo eliminar la pieza.",
        deleteGeneric: "No se pudo eliminar.",
        deleteSuccess: "Pieza eliminada.",
        configuredPieces: "pieza(s) configuradas.",
        emptyLanguage: "Aun no hay piezas personalizadas en {language} para esta seccion.",
        untitled: "Pieza sin titulo",
        active: "Activa",
        order: "Orden",
        preview: "Vista previa",
        noImage: "Sin imagen cargada",
        uploading: "Subiendo...",
        uploadImage: "Subir imagen",
        imageUrl: "URL de imagen",
        eyebrow: "Pretitulo",
        badge: "Etiqueta",
        title: "Titulo",
        description: "Descripcion",
        cta: "CTA",
        ctaLink: "Link del CTA",
        highlights: "Puntos clave (uno por linea)",
        saving: "Guardando...",
        savePiece: "Guardar pieza",
        deleting: "Eliminando...",
        delete: "Eliminar"
      }
    : {
        operations: "Content operations",
        visualCenter: "Site visual center",
        intro:
          "Control the main hero and visual home blocks here. If you do not save custom pieces, the site keeps using the default content from the codebase.",
        recommendation:
          "Hero recommendation: use real horizontal images, at least 1920x1080, minimal embedded text, and enough contrast for headlines over the image.",
        reload: "Reload content",
        reloading: "Reloading...",
        reloadError: "Unable to reload site media.",
        reloadGeneric: "Unable to reload.",
        uploadError: "Unable to upload the image.",
        uploadSuccess: "Image uploaded. Save the card to publish the change.",
        titleRequired: "Each piece needs a title.",
        bodyRequired: "Each piece needs a description.",
        imageRequired: "Upload or paste an image before saving.",
        saveError: "Unable to save the item.",
        saveGeneric: "Unable to save.",
        saveSuccess: "Changes saved.",
        deleteConfirm: 'Delete "{title}" from the site?',
        deleteError: "Unable to delete the item.",
        deleteGeneric: "Unable to delete.",
        deleteSuccess: "Item deleted.",
        configuredPieces: "configured item(s).",
        emptyLanguage: "No custom pieces yet in {language} for this section.",
        untitled: "Untitled item",
        active: "Active",
        order: "Order",
        preview: "Preview",
        noImage: "No image uploaded",
        uploading: "Uploading...",
        uploadImage: "Upload image",
        imageUrl: "Image URL",
        eyebrow: "Eyebrow",
        badge: "Badge",
        title: "Title",
        description: "Description",
        cta: "CTA",
        ctaLink: "CTA link",
        highlights: "Highlights (one per line)",
        saving: "Saving...",
        savePiece: "Save item",
        deleting: "Deleting...",
        delete: "Delete"
      };

  const sectionConfig: Record<SiteAssetSection, SectionConfig> = isEs
    ? {
        HOME_HERO: {
          title: "Hero principal",
          description:
            "Slides de apertura de la home en formato full-screen. Usa imagenes reales y de alta calidad para que el hero venda el producto desde el primer scroll.",
          addLabel: "Nuevo slide"
        },
        HOME_SHOWCASE: {
          title: "Bloques de apoyo",
          description:
            "Tarjetas visuales debajo del hero para sistemas, agentes, casos y otras lineas de venta.",
          addLabel: "Nueva tarjeta"
        }
      }
    : {
        HOME_HERO: {
          title: "Main hero",
          description:
            "Opening home slides in full-screen format. Use real, high-quality imagery so the hero sells the product from the first scroll.",
          addLabel: "New slide"
        },
        HOME_SHOWCASE: {
          title: "Support blocks",
          description:
            "Visual cards under the hero for systems, agents, case studies, and other sales lines.",
          addLabel: "New card"
        }
      };

  const languageLabels: Record<Language, string> = isEs
    ? { ES: "Espanol", EN: "Ingles" }
    : { ES: "Spanish", EN: "English" };

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
        throw new Error(payload.error ?? uiCopy.reloadError);
      }

      setAssets(payload.data);
      router.refresh();
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : uiCopy.reloadGeneric);
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
        throw new Error(payload.error ?? uiCopy.uploadError);
      }

      updateAsset(asset.id, {
        imageUrl: payload.data.url,
        blobUrl: payload.data.url
      });
      setMessage(uiCopy.uploadSuccess);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : uiCopy.uploadError);
    } finally {
      setUploadingId(null);
    }
  }

  async function saveAsset(asset: EditableSiteAsset) {
    setMessage(null);
    setError(null);

    if (!asset.title.trim()) {
      setError(uiCopy.titleRequired);
      return;
    }
    if (!asset.body.trim()) {
      setError(uiCopy.bodyRequired);
      return;
    }
    if (!asset.imageUrl.trim()) {
      setError(uiCopy.imageRequired);
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
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? uiCopy.saveError);
      }

      setMessage(uiCopy.saveSuccess);
      await reloadAssets();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : uiCopy.saveGeneric);
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

    const confirmed = window.confirm(uiCopy.deleteConfirm.replace("{title}", asset.title));
    if (!confirmed) {
      return;
    }

    setDeletingId(asset.id);

    try {
      const response = await fetch(`/api/site-assets?id=${asset.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? uiCopy.deleteError);
      }

      setMessage(uiCopy.deleteSuccess);
      await reloadAssets();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : uiCopy.deleteGeneric);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{uiCopy.operations}</p>
          <CardTitle>{uiCopy.visualCenter}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>{uiCopy.intro}</p>
          <div className="interactive-panel rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            {uiCopy.recommendation}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void reloadAssets()} disabled={isReloading}>
              {isReloading ? uiCopy.reloading : uiCopy.reload}
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
                        {groupedAssets[section][language].length} {uiCopy.configuredPieces}
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
                      {uiCopy.emptyLanguage.replace("{language}", languageLabels[language])}
                    </div>
                  ) : null}

                  {groupedAssets[section][language].map((asset) => (
                    <article
                      key={asset.id}
                      className="interactive-panel space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {asset.title.trim() || uiCopy.untitled}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <label className="inline-flex items-center gap-2">
                            <span>{uiCopy.active}</span>
                            <input
                              type="checkbox"
                              checked={asset.isActive}
                              onChange={(event) =>
                                updateAsset(asset.id, { isActive: event.target.checked })
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                            />
                          </label>
                          <Label htmlFor={`sortOrder-${asset.id}`}>{uiCopy.order}</Label>
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
                              alt={asset.title || uiCopy.preview}
                              className="h-56 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-56 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                              {uiCopy.noImage}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <label className="interactive-chip inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200">
                            {uploadingId === asset.id ? uiCopy.uploading : uiCopy.uploadImage}
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
                            <Label htmlFor={`imageUrl-${asset.id}`}>{uiCopy.imageUrl}</Label>
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
                          <Label htmlFor={`eyebrow-${asset.id}`}>{uiCopy.eyebrow}</Label>
                          <Input
                            id={`eyebrow-${asset.id}`}
                            value={asset.eyebrow ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { eyebrow: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`badge-${asset.id}`}>{uiCopy.badge}</Label>
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
                        <Label htmlFor={`title-${asset.id}`}>{uiCopy.title}</Label>
                        <Input
                          id={`title-${asset.id}`}
                          value={asset.title}
                          onChange={(event) => updateAsset(asset.id, { title: event.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`body-${asset.id}`}>{uiCopy.description}</Label>
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
                          <Label htmlFor={`ctaLabel-${asset.id}`}>{uiCopy.cta}</Label>
                          <Input
                            id={`ctaLabel-${asset.id}`}
                            value={asset.ctaLabel ?? ""}
                            onChange={(event) =>
                              updateAsset(asset.id, { ctaLabel: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ctaHref-${asset.id}`}>{uiCopy.ctaLink}</Label>
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
                        <Label htmlFor={`highlights-${asset.id}`}>{uiCopy.highlights}</Label>
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
                          {savingId === asset.id ? uiCopy.saving : uiCopy.savePiece}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void deleteAsset(asset)}
                          disabled={deletingId === asset.id}
                        >
                          {deletingId === asset.id ? uiCopy.deleting : uiCopy.delete}
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
