import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Input } from "../components/ui/input"; // or plain <input> if you prefer
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Upload, FileText } from "lucide-react";
import API from "../services/api";
import ModernAlert from "./ui/ModernAlert";

export default function CreateClubModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", desc: "", reason: "" });
  const [logo, setLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  if (!open) return null;

  const showAlert = (msg, type = "success") => {
    setAlertMessage(msg);
    setAlertType(type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.desc.trim() || !form.reason.trim()) {
      showAlert("Please fill in all fields.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("desc", form.desc);
      payload.append("reason", form.reason);
      if (logo) {
        payload.append("logo", logo);
      }

      await API.post("/clubs/requests", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("Club request submitted successfully.", "success");

      // notify parent to reload
      onCreated?.();

      // small delay then close
      setTimeout(() => {
        setForm({ name: "", desc: "", reason: "" });
        setLogo(null);
        setAlertMessage(null);
        onClose?.();
      }, 600);
    } catch (err) {
      console.error("Error submitting club request:", err);
      showAlert(
        err.response?.data?.message || "Failed to submit club request",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold mb-2">Create a New Club</h2>
      <p className="text-sm text-slate-600 mb-4">
        Submit a club idea. Your request will go to the Event Office for
        approval.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="club-name">Club Name</Label>
          <Input
            id="club-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Photography Club"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="club-reason">Why is this club needed?</Label>
          <Input
            id="club-reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="What gap does it fill?"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="club-desc">Description</Label>
          <Textarea
            id="club-desc"
            name="desc"
            rows={3}
            value={form.desc}
            onChange={handleChange}
            placeholder="Short description of the club activities..."
            className="resize-none"
            required
          />
        </div>

        {/* Logo upload */}
        <div className="space-y-1">
          <Label>Club Logo (optional but recommended)</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <Upload className="size-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm mb-3">
              Upload your club logo (.jpg / .png)
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="club-logo"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("club-logo").click()}
            >
              <Upload className="size-4 mr-2" />
              Upload Logo
            </Button>
            {logo && (
              <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded text-sm justify-center">
                <FileText className="size-4 text-blue-600" />
                <span className="text-slate-700">{logo.name}</span>
              </div>
            )}
          </div>
        </div>

        {alertMessage && (
          <ModernAlert
            message={alertMessage}
            type={alertType}
            onClose={() => setAlertMessage(null)}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
          >
            {submitting ? "Submitting..." : "Submit Club Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
