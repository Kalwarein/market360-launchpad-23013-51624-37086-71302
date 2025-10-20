import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type AccountType = "personal" | "company" | "organisation" | "government";

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [userId, setUserId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    // Company
    companyName: "",
    industry: "",
    businessRegNumber: "",
    // Organisation
    organisationName: "",
    organisationType: "",
    // Government
    departmentName: "",
    // Common
    profileImage: "",
    bannerImage: "",
    country: "Sierra Leone",
    city: "",
    streetAddress: "",
    email: "",
    facebookUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    missionDescription: "",
    servicesProducts: "",
    websiteUrl: "",
    interests: [] as string[],
    notificationEmail: true,
    notificationPush: true,
    paymentMethod: "",
    currencyDisplay: "SLE",
    agreedToTerms: false,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        if (profile.onboarding_completed) {
          navigate("/app/home");
          return;
        }
        setAccountType(profile.account_type);
        setFormData((prev) => ({
          ...prev,
          email: profile.email || "",
        }));
      }

      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  const getTotalSteps = () => {
    return 10; // Fixed 10 steps
  };

  const handleNext = () => {
    if (currentStep === 9 && !formData.agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, getTotalSteps()));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const updateData: any = {
        onboarding_completed: true,
        phone_number: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        street_address: formData.streetAddress,
        facebook_url: formData.facebookUrl,
        linkedin_url: formData.linkedinUrl,
        instagram_url: formData.instagramUrl,
        interests: formData.interests,
        notification_preferences: {
          email: formData.notificationEmail,
          push: formData.notificationPush,
        },
        payment_method: formData.paymentMethod,
        currency_display: formData.currencyDisplay,
      };

      if (accountType === "personal") {
        updateData.first_name = formData.firstName;
        updateData.last_name = formData.lastName;
        updateData.date_of_birth = formData.dateOfBirth;
      } else if (accountType === "company") {
        updateData.company_name = formData.companyName;
        updateData.industry = formData.industry;
        updateData.business_registration_number = formData.businessRegNumber;
        updateData.mission_description = formData.missionDescription;
        updateData.services_products = formData.servicesProducts;
        updateData.website_url = formData.websiteUrl;
      } else if (accountType === "organisation") {
        updateData.organisation_name = formData.organisationName;
        updateData.organisation_type = formData.organisationType;
        updateData.mission_description = formData.missionDescription;
        updateData.services_products = formData.servicesProducts;
        updateData.website_url = formData.websiteUrl;
      } else if (accountType === "government") {
        updateData.department_name = formData.departmentName;
        updateData.mission_description = formData.missionDescription;
        updateData.services_products = formData.servicesProducts;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Onboarding completed successfully.",
      });

      navigate("/app/home");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Market360</h1>
          <p className="text-muted-foreground">Let's set up your profile</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {getTotalSteps()}</span>
            <span>{Math.round((currentStep / getTotalSteps()) * 100)}%</span>
          </div>
          <Progress value={(currentStep / getTotalSteps()) * 100} />
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {/* Step 1: Account Type Confirmation */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Confirm Account Type</h2>
              <p className="text-muted-foreground">You selected a {accountType} account.</p>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  {accountType === "personal" && "Perfect for individuals looking to buy, sell, and connect."}
                  {accountType === "company" && "Ideal for businesses wanting to reach customers and post jobs."}
                  {accountType === "organisation" && "Great for NGOs and clubs to engage with the community."}
                  {accountType === "government" && "For official government departments and agencies."}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal/Company/Org/Gov Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {accountType === "personal" && "Personal Information"}
                {accountType === "company" && "Company Information"}
                {accountType === "organisation" && "Organisation Information"}
                {accountType === "government" && "Government Department Information"}
              </h2>

              {accountType === "personal" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </>
              )}

              {accountType === "company" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry / Sector *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">Business Registration Number</Label>
                    <Input
                      id="businessRegNumber"
                      value={formData.businessRegNumber}
                      onChange={(e) => setFormData({ ...formData, businessRegNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </>
              )}

              {accountType === "organisation" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organisationName">Organisation Name *</Label>
                    <Input
                      id="organisationName"
                      value={formData.organisationName}
                      onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisationType">Type of Organisation *</Label>
                    <Select
                      value={formData.organisationType}
                      onValueChange={(value) => setFormData({ ...formData, organisationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                        <SelectItem value="government">Government Department</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </>
              )}

              {accountType === "government" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="departmentName">Department / Agency Name *</Label>
                    <Input
                      id="departmentName"
                      value={formData.departmentName}
                      onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Official Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Profile Image/Banner */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Profile Images</h2>
              <p className="text-sm text-muted-foreground">Upload your profile picture{accountType !== "personal" && " and banner image"}</p>
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Picture URL</Label>
                <Input
                  id="profileImage"
                  placeholder="https://example.com/image.jpg"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">For now, paste an image URL. File upload coming soon.</p>
              </div>
              {accountType !== "personal" && (
                <div className="space-y-2">
                  <Label htmlFor="bannerImage">Banner Image URL</Label>
                  <Input
                    id="bannerImage"
                    placeholder="https://example.com/banner.jpg"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Address & Location */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Address & Location</h2>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City / Region *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address (Optional)</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 5: Contact & Social */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Contact & Social Links</h2>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Confirmed)</Label>
                <Input id="email" value={formData.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  placeholder="https://instagram.com/yourprofile"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 6: Business/Org Details (if applicable) */}
          {currentStep === 6 && accountType !== "personal" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {accountType === "company" && "Business Details"}
                {accountType === "organisation" && "Organisation Details"}
                {accountType === "government" && "Department Details"}
              </h2>
              <div className="space-y-2">
                <Label htmlFor="missionDescription">Mission / Description *</Label>
                <Textarea
                  id="missionDescription"
                  value={formData.missionDescription}
                  onChange={(e) => setFormData({ ...formData, missionDescription: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicesProducts">Services / Products Offered</Label>
                <Textarea
                  id="servicesProducts"
                  value={formData.servicesProducts}
                  onChange={(e) => setFormData({ ...formData, servicesProducts: e.target.value })}
                  rows={3}
                />
              </div>
              {accountType !== "government" && (
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://yourwebsite.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && accountType === "personal" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Skip Business Details</h2>
              <p className="text-muted-foreground">This step is for companies and organisations only.</p>
            </div>
          )}

          {/* Step 7: Preferences & Interests */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Preferences & Interests</h2>
              <div className="space-y-2">
                <Label>Categories of Interest</Label>
                <div className="space-y-2">
                  {["Jobs", "Stores", "Digital Assets", "Community", "Freelancers"].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, interests: [...formData.interests, interest] });
                          } else {
                            setFormData({
                              ...formData,
                              interests: formData.interests.filter((i) => i !== interest),
                            });
                          }
                        }}
                      />
                      <label htmlFor={interest} className="text-sm cursor-pointer">
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notification Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notificationEmail"
                      checked={formData.notificationEmail}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, notificationEmail: checked as boolean })
                      }
                    />
                    <label htmlFor="notificationEmail" className="text-sm cursor-pointer">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notificationPush"
                      checked={formData.notificationPush}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, notificationPush: checked as boolean })
                      }
                    />
                    <label htmlFor="notificationPush" className="text-sm cursor-pointer">
                      Push Notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Token/Payment */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Payment Preferences</h2>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyDisplay">Currency Display</Label>
                <Select
                  value={formData.currencyDisplay}
                  onValueChange={(value) => setFormData({ ...formData, currencyDisplay: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLE">SLE (Leone)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 9: Terms & Conditions */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Terms & Conditions</h2>
              <div className="p-4 border rounded-lg max-h-64 overflow-y-auto">
                <h3 className="font-semibold mb-2">Terms of Service</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  By using Market360, you agree to our terms of service and privacy policy. We are committed to
                  protecting your data and providing a safe marketplace.
                </p>
                <h3 className="font-semibold mb-2">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal information will be used to provide you with the best experience on our platform. We
                  will never share your data without your consent.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the Terms of Service and Privacy Policy *
                </label>
              </div>
            </div>
          )}

          {/* Step 10: Review & Complete */}
          {currentStep === 10 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Review Your Information</h2>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold">Account Type</p>
                  <p className="text-sm text-muted-foreground capitalize">{accountType}</p>
                </div>
                {accountType === "personal" && (
                  <>
                    <div>
                      <p className="text-sm font-semibold">Name</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                  </>
                )}
                {accountType === "company" && (
                  <div>
                    <p className="text-sm font-semibold">Company</p>
                    <p className="text-sm text-muted-foreground">{formData.companyName}</p>
                  </div>
                )}
                {accountType === "organisation" && (
                  <div>
                    <p className="text-sm font-semibold">Organisation</p>
                    <p className="text-sm text-muted-foreground">{formData.organisationName}</p>
                  </div>
                )}
                {accountType === "government" && (
                  <div>
                    <p className="text-sm font-semibold">Department</p>
                    <p className="text-sm text-muted-foreground">{formData.departmentName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.city}, {formData.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Interests</p>
                  <p className="text-sm text-muted-foreground">{formData.interests.join(", ") || "None selected"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You can edit these details later from your profile settings.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || submitting}>
              Previous
            </Button>

            {currentStep < getTotalSteps() ? (
              <Button onClick={handleNext} disabled={submitting}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete Onboarding"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}