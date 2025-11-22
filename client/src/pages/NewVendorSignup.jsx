import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { GraduationCap, ArrowLeft, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "../services/api";

export default function NewVendorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [taxDocument, setTaxDocument] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.companyName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!taxDocument || !logo) {
      toast.error("Please upload both Tax Document and Company Logo");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("confirmPassword", formData.confirmPassword);
      payload.append("role", "vendor");
      payload.append("companyName", formData.companyName);
      payload.append("taxDocument", taxDocument);
      payload.append("logo", logo);

      await API.post("/auth/register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Vendor account created! Pending admin approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTaxDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTaxDocument(file);
      toast.success("Tax document uploaded");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      toast.success("Logo uploaded");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/signup-selection")}
            className="absolute left-6 top-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-center">
            <div className="flex justify-center">
            <img src="http://localhost:4000/uploads/logo/logoredefined.png"  alt="Innovex" className="w-40 h-40 object-contain"/>
          </div>
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">Vendor Registration</CardTitle>
            <p className="text-slate-600">Register your company for campus events</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Your Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Company Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax Document *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="size-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm mb-3">
                  Upload business license or tax certificate
                </p>
                <Input
                  type="file"
                  onChange={handleTaxDocUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="taxDoc"
                />
                <Label htmlFor="taxDoc">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="size-4 mr-2" />
                      Upload Document
                    </span>
                  </Button>
                </Label>
                {taxDocument && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded text-sm justify-center">
                    <FileText className="size-4 text-blue-600" />
                    <span className="text-slate-700">{taxDocument.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Logo *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="size-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 text-sm mb-3">
                  Upload your company logo
                </p>
                <Input
                  type="file"
                  onChange={handleLogoUpload}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="logo"
                />
                <Label htmlFor="logo">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="size-4 mr-2" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                {logo && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded text-sm justify-center">
                    <FileText className="size-4 text-blue-600" />
                    <span className="text-slate-700">{logo.name}</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Vendor Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
