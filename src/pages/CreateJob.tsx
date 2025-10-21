import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function CreateJob() {
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    job_type: "full-time",
    location: "",
    salary_min: "",
    salary_max: "",
    application_fee: "2",
    requirements: [] as string[],
    skills_required: [] as string[],
    custom_fields: [] as Array<{label: string, type: string, placeholder?: string}>
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newField, setNewField] = useState({label: "", type: "text", placeholder: ""});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // @ts-ignore
      const { error } = await (supabase as any).from("jobs").insert({
        title: formData.title,
        description: formData.description,
        job_type: formData.job_type as any,
        location: formData.location || null,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        application_fee: parseFloat(formData.application_fee),
        requirements: formData.requirements.length > 0 ? formData.requirements : null,
        skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
        custom_fields: formData.custom_fields.length > 0 ? formData.custom_fields : null,
      } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posted successfully!",
      });
      navigate("/jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({...formData, requirements: [...formData.requirements, newRequirement.trim()]});
      setNewRequirement("");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({...formData, skills_required: [...formData.skills_required, newSkill.trim()]});
      setNewSkill("");
    }
  };

  const addCustomField = () => {
    if (newField.label.trim()) {
      setFormData({...formData, custom_fields: [...formData.custom_fields, {...newField}]});
      setNewField({label: "", type: "text", placeholder: ""});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl mt-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/jobs")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Post a New Job - Step {step} of 2</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select 
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Remote, Freetown, etc."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Min Salary (SLE)</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Max Salary (SLE)</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="application_fee">Application Fee (SLE) *</Label>
                    <Input
                      id="application_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.application_fee}
                      onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Applicants will pay this amount to apply</p>
                  </div>

                  <Button type="button" onClick={() => setStep(2)} className="w-full">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description * (100+ characters)</Label>
                    <Textarea
                      id="description"
                      required
                      rows={6}
                      minLength={100}
                      placeholder="Provide a detailed description of the job..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">{formData.description.length} / 100 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add requirement..."
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                      />
                      <Button type="button" onClick={addRequirement} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-muted p-2 rounded">
                          <span className="flex-1 text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData({
                              ...formData,
                              requirements: formData.requirements.filter((_, i) => i !== idx)
                            })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {skill}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              skills_required: formData.skills_required.filter((_, i) => i !== idx)
                            })}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Application Fields</Label>
                    <div className="space-y-2 p-3 border rounded">
                      <Input
                        placeholder="Field label..."
                        value={newField.label}
                        onChange={(e) => setNewField({...newField, label: e.target.value})}
                      />
                      <Select value={newField.type} onValueChange={(v) => setNewField({...newField, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Input</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Placeholder text..."
                        value={newField.placeholder}
                        onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                      />
                      <Button type="button" onClick={addCustomField} size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.custom_fields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                          <div>
                            <p className="text-sm font-medium">{field.label}</p>
                            <p className="text-xs text-muted-foreground">{field.type}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData({
                              ...formData,
                              custom_fields: formData.custom_fields.filter((_, i) => i !== idx)
                            })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading || formData.description.length < 100}>
                      {loading ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
