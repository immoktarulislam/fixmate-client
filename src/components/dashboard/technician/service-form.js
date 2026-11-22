"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/image-upload";

const EMPTY = {
  title: "",
  category: "",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
  image: "",
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  else if (form.title.trim().length < 6) errors.title = "Use at least 6 characters";
  if (!form.category) errors.category = "Pick a category";
  if (!form.description.trim()) errors.description = "Description is required";
  else if (form.description.trim().length < 20) errors.description = "Write at least 20 characters";
  const price = Number(form.basePrice);
  if (!form.basePrice) errors.basePrice = "Base price is required";
  else if (!Number.isFinite(price) || price <= 0) errors.basePrice = "Enter a positive number";
  return errors;
}

/** Shared create/edit form for technician services. */
export default function ServiceForm({ initial, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    await onSubmit({
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      estimatedDuration: form.estimatedDuration.trim(),
      serviceMode: form.serviceMode,
      serviceArea: form.serviceArea.trim(),
      image: form.image || "/services/default.svg",
    });
  }

  const err = (key) =>
    errors[key] && (
      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors[key]}</p>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="svc-title">Service title</Label>
          <Input
            id="svc-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. AC gas refill & deep cleaning"
            className="mt-1.5"
          />
          {err("title")}
        </div>

        <div>
          <Label htmlFor="svc-category">Category</Label>
          <Select
            id="svc-category"
            className="mt-1.5"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Select a category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {err("category")}
        </div>

        <div>
          <Label htmlFor="svc-mode">Service mode</Label>
          <Select
            id="svc-mode"
            className="mt-1.5"
            value={form.serviceMode}
            onChange={(e) => set("serviceMode", e.target.value)}
          >
            {SERVICE_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="svc-price">Base price (USD)</Label>
          <Input
            id="svc-price"
            type="number"
            min="1"
            step="1"
            value={form.basePrice}
            onChange={(e) => set("basePrice", e.target.value)}
            placeholder="49"
            className="mt-1.5"
          />
          {err("basePrice")}
        </div>

        <div>
          <Label htmlFor="svc-duration">Estimated duration</Label>
          <Input
            id="svc-duration"
            value={form.estimatedDuration}
            onChange={(e) => set("estimatedDuration", e.target.value)}
            placeholder="45–60 min"
            className="mt-1.5"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="svc-area">Service area</Label>
          <Input
            id="svc-area"
            value={form.serviceArea}
            onChange={(e) => set("serviceArea", e.target.value)}
            placeholder="e.g. Dhanmondi, Gulshan, Uttara"
            className="mt-1.5"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="svc-desc">Description</Label>
          <Textarea
            id="svc-desc"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What is included, what the customer should expect…"
            className="mt-1.5"
          />
          {err("description")}
        </div>

        <div className="sm:col-span-2">
          <Label>Cover image</Label>
          <div className="mt-1.5 max-w-md">
            <ImageUpload value={form.image} onChange={(v) => set("image", v)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Create service"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
