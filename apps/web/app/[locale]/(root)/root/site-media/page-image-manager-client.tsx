"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageImageAdminPage } from "@/lib/page-images";

type PageImageManagerClientProps = {
  locale: string;
  initialPages: PageImageAdminPage[];
};

type PageSlotState = {
  currentImageUrl: string;
  currentBlobUrl: string | null;
  currentAlt: string;
};

export function PageImageManagerClient({
  locale,
  initialPages
}: PageImageManagerClientProps) {
  const isEs = locale.startsWith("es");
  const [pages, setPages] = useState(initialPages);
  const [selectedPageId, setSelectedPageId] = useState(initialPages[0]?.pageId ?? "");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const uiCopy = isEs
    ? {
        pages: "Paginas",
        pagePreview: "Vista de pagina",
        currentImage: "Imagen actual",
        alt: "Texto alterno",
        imageUrl: "URL de imagen",
        upload: "Subir imagen",
        uploading: "Subiendo...",
        save: "Guardar cambio",
        saving: "Guardando...",
        reset: "Volver al default",
        useDefault: "Usando imagen por defecto",
        customImage: "Usando imagen personalizada",
        reloading: "Recargando...",
        recommended: "Formato sugerido",
        updated: "Ultima actualizacion",
        openPage: "Abrir pagina",
        saved: "Imagen guardada.",
        resetDone: "Slot restaurado al valor por defecto.",
        uploadDone: "Imagen subida. Guarda el slot para publicarla.",
        loadFailed: "No se pudo recargar el gestor de imagenes.",
        uploadFailed: "No se pudo subir la imagen.",
        saveFailed: "No se pudo guardar el slot.",
        resetFailed: "No se pudo restaurar el slot."
      }
    : {
        pages: "Pages",
        pagePreview: "Page preview",
        currentImage: "Current image",
        alt: "Alt text",
        imageUrl: "Image URL",
        upload: "Upload image",
        uploading: "Uploading...",
        save: "Save change",
        saving: "Saving...",
        reset: "Reset to default",
        useDefault: "Using default image",
        customImage: "Using custom image",
        reloading: "Reloading...",
        recommended: "Recommended format",
        updated: "Last updated",
        openPage: "Open page",
        saved: "Image saved.",
        resetDone: "Slot reset to default.",
        uploadDone: "Image uploaded. Save the slot to publish it.",
        loadFailed: "Unable to reload the image manager.",
        uploadFailed: "Unable to upload the image.",
        saveFailed: "Unable to save the slot.",
        resetFailed: "Unable to reset the slot."
      };

  const selectedPage = useMemo(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId]
  );

  function updateSlotState(pageId: string, slotId: string, patch: Partial<PageSlotState>) {
    setPages((current) =>
      current.map((page) =>
        page.pageId === pageId
          ? {
              ...page,
              slots: page.slots.map((slot) =>
                slot.slotId === slotId
                  ? {
                      ...slot,
                      currentImageUrl: patch.currentImageUrl ?? slot.currentImageUrl,
                      currentBlobUrl:
                        patch.currentBlobUrl !== undefined ? patch.currentBlobUrl : slot.currentBlobUrl,
                      currentAlt: patch.currentAlt ?? slot.currentAlt
                    }
                  : slot
              )
            }
          : page
      )
    );
  }

  async function reloadPages() {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/page-images?locale=${locale}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { data?: PageImageAdminPage[]; error?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? uiCopy.loadFailed);
      }

      setPages(payload.data);
      if (!payload.data.some((page) => page.pageId === selectedPageId)) {
        setSelectedPageId(payload.data[0]?.pageId ?? "");
      }
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : uiCopy.loadFailed);
    }
  }

  async function uploadImage(pageId: string, slotId: string, file: File) {
    setMessage(null);
    setError(null);
    setUploadingKey(`${pageId}:${slotId}`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageId", pageId);
      formData.append("slotId", slotId);

      const response = await fetch("/api/page-images/upload", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { url: string; pathname: string };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? uiCopy.uploadFailed);
      }

      updateSlotState(pageId, slotId, {
        currentImageUrl: payload.data.url,
        currentBlobUrl: payload.data.url
      });
      setMessage(uiCopy.uploadDone);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : uiCopy.uploadFailed);
    } finally {
      setUploadingKey(null);
    }
  }

  function saveSlot(pageId: string, slotId: string, slot: PageImageAdminPage["slots"][number]) {
    setMessage(null);
    setError(null);
    setSavingKey(`${pageId}:${slotId}`);

    startTransition(async () => {
      try {
        const response = await fetch("/api/page-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            pageId,
            slotId,
            imageUrl: slot.currentImageUrl,
            blobUrl: slot.currentBlobUrl,
            alt: slot.currentAlt
          })
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? uiCopy.saveFailed);
        }

        await reloadPages();
        setMessage(uiCopy.saved);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : uiCopy.saveFailed);
      } finally {
        setSavingKey(null);
      }
    });
  }

  function resetSlot(pageId: string, slotId: string) {
    setMessage(null);
    setError(null);
    setSavingKey(`${pageId}:${slotId}`);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/page-images?pageId=${encodeURIComponent(pageId)}&slotId=${encodeURIComponent(slotId)}`,
          { method: "DELETE" }
        );
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? uiCopy.resetFailed);
        }

        await reloadPages();
        setMessage(uiCopy.resetDone);
      } catch (resetError) {
        setError(resetError instanceof Error ? resetError.message : uiCopy.resetFailed);
      } finally {
        setSavingKey(null);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <Card className="interactive-panel h-fit">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{uiCopy.pages}</p>
          <CardTitle>{uiCopy.pagePreview}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pages.map((page) => (
            <button
              key={page.pageId}
              type="button"
              onClick={() => setSelectedPageId(page.pageId)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                page.pageId === selectedPage?.pageId
                  ? "border-slate-900 bg-slate-950 text-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]"
                  : "border-black/8 bg-white/90 text-slate-700 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <div className="text-sm font-semibold">{page.title}</div>
              <div
                className={`mt-2 text-xs leading-relaxed ${
                  page.pageId === selectedPage?.pageId ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {page.description}
              </div>
            </button>
          ))}
          <Button type="button" variant="outline" onClick={() => void reloadPages()} disabled={isPending}>
            {isPending ? uiCopy.reloading : uiCopy.pagePreview}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
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

        {selectedPage ? (
          <>
            <Card className="interactive-panel">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{selectedPage.title}</CardTitle>
                    <p className="mt-2 text-sm text-slate-500">{selectedPage.description}</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href={`/${locale}${selectedPage.publicPath}`} target="_blank" rel="noreferrer">
                      {uiCopy.openPage}
                    </a>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              {selectedPage.slots.map((slot) => {
                const key = `${selectedPage.pageId}:${slot.slotId}`;
                return (
                  <Card key={slot.slotId} className="interactive-panel overflow-hidden">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{slot.label}</CardTitle>
                          <p className="mt-2 text-sm text-slate-500">{slot.description}</p>
                        </div>
                        <div className="rounded-full border border-black/8 bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {slot.hasOverride ? uiCopy.customImage : uiCopy.useDefault}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="overflow-hidden rounded-[24px] border border-black/8 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slot.currentImageUrl}
                          alt={slot.currentAlt}
                          className="h-64 w-full object-cover"
                        />
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${key}-alt`}>{uiCopy.alt}</Label>
                          <Input
                            id={`${key}-alt`}
                            value={slot.currentAlt}
                            onChange={(event) =>
                              updateSlotState(selectedPage.pageId, slot.slotId, {
                                currentAlt: event.target.value
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${key}-url`}>{uiCopy.imageUrl}</Label>
                          <Input
                            id={`${key}-url`}
                            value={slot.currentImageUrl}
                            onChange={(event) =>
                              updateSlotState(selectedPage.pageId, slot.slotId, {
                                currentImageUrl: event.target.value
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 text-xs text-slate-500 md:grid-cols-2">
                        <div>
                          <span className="font-semibold text-slate-700">{uiCopy.recommended}:</span> {slot.recommended}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">{uiCopy.updated}:</span>{" "}
                          {slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : "-"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <label className="interactive-chip inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
                          {uploadingKey === key ? uiCopy.uploading : uiCopy.upload}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                void uploadImage(selectedPage.pageId, slot.slotId, file);
                                event.target.value = "";
                              }
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          onClick={() => saveSlot(selectedPage.pageId, slot.slotId, slot)}
                          disabled={savingKey === key || uploadingKey === key}
                        >
                          {savingKey === key ? uiCopy.saving : uiCopy.save}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => resetSlot(selectedPage.pageId, slot.slotId)}
                          disabled={savingKey === key || uploadingKey === key}
                        >
                          {uiCopy.reset}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
