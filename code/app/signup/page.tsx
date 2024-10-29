"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
// Assuming you have a ProgressBar component

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

import {
  HYGIENE_RATING,
  LOGIN_TYPES,
  QUERY_PARAM_NAME,
} from "@/lib/login/constants";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import { registerUser } from "@/actions/signup";

const donorSignupScheme = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password cannot be empty"),
  confirm_password: z.string().min(1, "Password cannot be empty"),
  agency: z.string().min(1, "Donor Name cannot be empty"),
  uen: z.string(),
  address: z.string(),
  poc_name: z.string().min(1, "Point of Contact Name should not be empty"),
  poc_phone: z.string().min(8, "Phone number(8 digits) is required"),
  halal_certified: z.boolean(),
  hygiene_certification: HYGIENE_RATING,
});

const beneficiarySignupScheme = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password cannot be empty"),
  confirm_password: z.string().min(1, "Password cannot be empty"),
  agency: z.string().min(1, "Donor Name cannot be empty"),
  poc_name: z.string().min(1, "Point of Contact Name should not be empty"),
  poc_phone: z.string().min(8, "Phone number(8 digits) is required"),
});

const adminSignupScheme = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password cannot be empty"),
  confirm_password: z.string().min(1, "Password cannot be empty"),
});

function Cards() {
  const router = useRouter();
  const [businessNames, setBusinessNames] = useState([]);
  const [businessAddresses, setBusinessAddresses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");

  const searchParams = useSearchParams();
  const form = searchParams?.get(QUERY_PARAM_NAME) ?? "";
  const formToRender = LOGIN_TYPES.includes(form) ? form : LOGIN_TYPES[0];

  // Password strength calculation function
  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/\W/.test(password)) strength += 1;

    return strength;
  }

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);

    // Provide feedback based on password strength
    switch (strength) {
      case 0:
      case 1:
        setPasswordFeedback("Too Weak");
        break;
      case 2:
        setPasswordFeedback("Weak");
        break;
      case 3:
        setPasswordFeedback("Medium");
        break;
      case 4:
        setPasswordFeedback("Strong");
        break;
      case 5:
        setPasswordFeedback("Very Strong");
        break;
      default:
        setPasswordFeedback("");
    }
  };

  useEffect(() => {
    const datasetId = "d_1bf762ee1d6d7fb61192cb442fb2f5b4";
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const records = data.result.records;

        // Initialize an empty object to store business names and their corresponding addresses
        const businessNameMap = {};

        records.forEach((record) => {
          // Normalize the business name to lowercase to ensure case-insensitive matching
          const normalizedBusinessName = record.business_name.toUpperCase();

          // If the business name doesn't exist in the map, initialize it with an empty array
          if (!businessNameMap[normalizedBusinessName]) {
            businessNameMap[normalizedBusinessName] = [];
          }

          // Push the premise address into the array for that business name, storing all branch addresses
          businessNameMap[normalizedBusinessName].push(record.premise_address);
        });

        // Set the unique business names and their corresponding addresses in state
        setBusinessNames(Object.keys(businessNameMap));
        setBusinessAddresses(businessNameMap); // This stores the map of business names to their addresses
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const donorSignupForm = useForm<z.infer<typeof donorSignupScheme>>({
    resolver: zodResolver(donorSignupScheme),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      agency: "",
      uen: "",
      address: "",
      poc_name: "",
      poc_phone: "",
      halal_certified: false,
    },
  });

  const beneficiarySignupForm = useForm<
    z.infer<typeof beneficiarySignupScheme>
  >({
    resolver: zodResolver(beneficiarySignupScheme),
  });

  const adminSignupForm = useForm<z.infer<typeof adminSignupScheme>>({
    resolver: zodResolver(adminSignupScheme),
  });

  async function fetchAdminList() {
    try {
      const response = await fetch(`/api/adminList`);
      if (response.ok) {
        const users = await response.json();
        return users.map((user) => user.email);
      } else {
        console.error("Error fetching admin data:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      return [];
    }
  }

  async function onSubmitDonorSignup(
    values: z.infer<typeof donorSignupScheme>
  ) {
    const adminEmails = await fetchAdminList();
    if (adminEmails.includes(values.email)) {
      donorSignupForm.setError("root", {
        type: "manual",
        message: `Email already exists`,
      });
      return;
    }
    if (values.password !== values.confirm_password) {
      donorSignupForm.setError("confirm_password", {
        type: "manual",
        message: `Passwords don't match!`,
      });
      return;
    }

    const user = await registerUser({
      email: values.email,
      password: values.password,
      agency: values.agency,
      uen: values.uen,
      address: values.address,
      poc_name: values.poc_name,
      poc_phone: values.poc_phone,
      halal_certification: values.halal_certified,
      hygiene_certification: values.hygiene_certification,
      role: "donor",
    });

    if (user?.error) {
      donorSignupForm.setError("root", {
        type: "manual",
        message: user.error,
      });
    } else {
      router.push("/login?type=donor");
    }
  }

  async function onSubmitBeneficiarySignup(
    values: z.infer<typeof beneficiarySignupScheme>
  ) {
    const adminEmails = await fetchAdminList();
    if (adminEmails.includes(values.email)) {
      beneficiarySignupForm.setError("root", {
        type: "manual",
        message: `Email already exists`,
      });
      return;
    }
    if (values.password !== values.confirm_password) {
      beneficiarySignupForm.setError("confirm_password", {
        type: "manual",
        message: `Passwords don't match!`,
      });
      return;
    }

    const user = await registerUser({
      email: values.email,
      password: values.password,
      agency: values.agency,
      uen: "",
      address: "",
      poc_name: values.poc_name,
      poc_phone: values.poc_phone,
      halal_certification: false,
      hygiene_certification: "D",
      role: "beneficiary",
    });

    if (user?.error) {
      beneficiarySignupForm.setError("root", {
        type: "manual",
        message: user.error,
      });
    } else {
      router.push("/login?type=beneficiary");
    }
  }

  async function onSubmitAdminSignup(
    values: z.infer<typeof adminSignupScheme>
  ) {
    try {
      const response = await fetch(`/api/adminList`);
      if (response.ok) {
        const users = await response.json();

        const isEmailInAdminList = users.some(
          (user) => user.email === values.email
        );
        if (!isEmailInAdminList) {
          adminSignupForm.setError("email", {
            type: "manual",
            message: `You are not allowed to sign up as admin!`,
          });
          return;
        }

        if (values.password !== values.confirm_password) {
          adminSignupForm.setError("confirm_password", {
            type: "manual",
            message: `Passwords don't match!`,
          });
          return;
        }

        const user = await registerUser({
          email: values.email,
          password: values.password,
          agency: "",
          uen: "",
          address: "",
          poc_name: "",
          poc_phone: "",
          halal_certification: false,
          hygiene_certification: "D",
          acceptedItems: [],
          role: "admin",
        });

        if (user?.error) {
          adminSignupForm.setError("root", {
            type: "manual",
            message: user.error,
          });
        } else {
          router.push("/login?type=admin");
        }
      } else {
        console.error("Error fetching admin data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }

  function updateUrlHistory(render: string) {
    const newParams = new URLSearchParams(searchParams?.toString());
    newParams.set("type", render);
    window.history.replaceState(null, "", `?${newParams.toString()}`);
  }

  return (
    <section className="h-full w-full flex flex-col items-center">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-4">
          <Tabs defaultValue={formToRender} className="w-[75%] min-w-[512px]">
            {/* Define the list of tabs */}
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger
                className="data-[state=active]:text-white data-[state=active]:bg-custom-dark-green"
                value="donor"
                onClick={() => {
                  updateUrlHistory("donor");
                }}
              >
                Donor Sign Up
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:text-white data-[state=active]:bg-custom-dark-green"
                value="beneficiary"
                onClick={() => {
                  updateUrlHistory("beneficiary");
                }}
              >
                Beneficiary Sign Up
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:text-white data-[state=active]:bg-custom-dark-green"
                value="admin"
                onClick={() => {
                  updateUrlHistory("admin");
                }}
              >
                Admin Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Define the contents of the tabs here */}
            {/* Donor card */}
            <TabsContent value="donor">
              <Card className="w-[100%] mt-4 min-w-[512px]">
                <CardHeader>
                  <CardTitle className="pt-4">Donor Sign Up</CardTitle>
                  <CardDescription className="pt-2">
                    Fill in your personal details and some information about you
                    to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...donorSignupForm}>
                    <form
                      onSubmit={donorSignupForm.handleSubmit(
                        onSubmitDonorSignup
                      )}
                      className="flex flex-col gap-4"
                    >
                      <p className="mt-4 font-bold">Details</p>
                      <FormField
                        control={donorSignupForm.control}
                        name="agency"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Organisation Name</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value); // Update the agency (business name)
                                    setSelectedBusiness(value); // Set selected business to show related addresses
                                  }}
                                >
                                  <SelectTrigger
                                    style={{ backgroundColor: "white" }}
                                  >
                                    <SelectValue placeholder="Select an organisation" />
                                  </SelectTrigger>
                                  <SelectContent
                                    style={{ backgroundColor: "white" }}
                                  >
                                    {businessNames.map((name, index) => (
                                      <SelectItem key={index} value={name}>
                                        {name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={donorSignupForm.control}
                        name="address"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Premise Address</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange}>
                                  <SelectTrigger
                                    style={{ backgroundColor: "white" }}
                                  >
                                    <SelectValue placeholder="Select a premise address" />
                                  </SelectTrigger>
                                  <SelectContent
                                    style={{ backgroundColor: "white" }}
                                  >
                                    {selectedBusiness &&
                                      businessAddresses[selectedBusiness]?.map(
                                        (address, index) => (
                                          <SelectItem
                                            key={index}
                                            value={address}
                                          >
                                            {address}
                                          </SelectItem>
                                        )
                                      )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={donorSignupForm.control}
                        name="uen"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>UEN Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="UEN (if applicable)..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={donorSignupForm.control}
                        name="poc_name"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Point of Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Name..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={donorSignupForm.control}
                        name="poc_phone"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>
                                Point of Contact Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="Phone Number..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <p className="mt-4 font-bold">Certification Status</p>
                      <FormField
                        control={donorSignupForm.control}
                        name="halal_certified"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>
                                Select if your organisation is Halal certified.
                              </FormLabel>
                              <FormDescription>
                                If you declare that your organisation is Halal
                                certified, random checks may be done to ensure
                                that your organisation is Halal certified.
                              </FormDescription>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={donorSignupForm.control}
                        name="hygiene_certification"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>
                                Organisation's hygiene rating
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    style={{ backgroundColor: "white" }}
                                  >
                                    <SelectValue placeholder="Select a hygiene rating" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent
                                  style={{ backgroundColor: "white" }}
                                >
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          );
                        }}
                      />

                      <p className="mt-4 font-bold">Account Details</p>
                      <FormField
                        control={donorSignupForm.control}
                        name="email"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Email..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={donorSignupForm.control}
                        name="password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Password..."
                                  type="password"
                                  onChange={(e) => {
                                    handlePasswordChange(e); // Update password strength
                                    field.onChange(e); // Pass value to the form handler
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="mt-2">
                                <ProgressBar
                                  value={(passwordStrength / 5) * 100}
                                />{" "}
                                {/* Password strength progress */}
                                <p
                                  className={`text-sm mt-1 ${
                                    passwordStrength <= 2
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {passwordFeedback}
                                </p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={donorSignupForm.control}
                        name="confirm_password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Confirm Password..."
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {donorSignupForm.formState.errors.root && (
                        <p className="text-red-600">
                          {donorSignupForm.formState.errors.root.message}
                        </p>
                      )}

                      {donorSignupForm.formState.isSubmitSuccessful && (
                        <p className="text-green-600">
                          Sign Up Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className="w-full mt-4 text-white bg-custom-dark-green hover:bg-custom-darker-green"
                        type="submit"
                      >
                        Sign Up
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center mt-4">
                  <p className="text-sm">
                    Already have an account? Click{" "}
                    <Link href="/login?type=donor" className="underline">
                      here
                    </Link>{" "}
                    to login!
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Beneficiary card */}
            <TabsContent value="beneficiary">
              <Card className="w-[100%] mt-4 min-w-[412px]">
                <CardHeader>
                  <CardTitle className="pt-4">Beneficiary Sign Up</CardTitle>
                  <CardDescription className="pt-2 pb-2">
                    Enter in your email and password to your Beneficiary account
                    to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...beneficiarySignupForm}>
                    <form
                      onSubmit={beneficiarySignupForm.handleSubmit(
                        onSubmitBeneficiarySignup
                      )}
                      className="flex flex-col gap-4"
                    >
                      <p className="mt-4 font-bold">Contact Information</p>
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="agency"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Agency Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Agency Name..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="poc_name"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Point of Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Name..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="poc_phone"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>
                                Point of Contact Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="Phone Number..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <p className="mt-4 font-bold">Account Details</p>
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="email"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Email..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Password..."
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={beneficiarySignupForm.control}
                        name="confirm_password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Confirm Password..."
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {beneficiarySignupForm.formState.errors.root && (
                        <p className="text-red-600">
                          {beneficiarySignupForm.formState.errors.root.message}
                        </p>
                      )}

                      {beneficiarySignupForm.formState.isSubmitSuccessful && (
                        <p className="text-green-600">
                          Sign Up Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className="w-full mt-4 text-white bg-custom-dark-green hover:bg-custom-darker-green"
                        type="submit"
                      >
                        Sign Up
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center mt-4">
                  <p className="text-sm">
                    Already have an account? Click{" "}
                    <Link href="/login?type=beneficiary" className="underline">
                      here
                    </Link>{" "}
                    to login!
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Admin card */}
            <TabsContent value="admin">
              <Card className="w-[100%] mt-4 min-w-[412px]">
                <CardHeader>
                  <CardTitle className="pt-4">Admin Sign Up</CardTitle>
                  <CardDescription className="pt-2 pb-2">
                    Enter in your Administrator credentials to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...adminSignupForm}>
                    <form
                      onSubmit={adminSignupForm.handleSubmit(
                        onSubmitAdminSignup
                      )}
                      className="flex flex-col gap-4"
                    >
                      <FormField
                        control={adminSignupForm.control}
                        name="email"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Email..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={adminSignupForm.control}
                        name="password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Password..."
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={adminSignupForm.control}
                        name="confirm_password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Confirm Password..."
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {adminSignupForm.formState.errors.root && (
                        <p className="text-red-600">
                          {adminSignupForm.formState.errors.root.message}
                        </p>
                      )}

                      {adminSignupForm.formState.isSubmitSuccessful && (
                        <p className="text-green-600">
                          Sign Up Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className="w-full mt-4 text-white bg-custom-dark-green hover:bg-custom-darker-green"
                        type="submit"
                      >
                        Sign Up
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center mt-4">
                  <p className="text-sm">
                    Already have an admin account? Click{" "}
                    <Link href="/login?type=admin" className="underline">
                      here
                    </Link>{" "}
                    to login!
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();

  // if (useSession().data) {
  //   router.push('/dashboard');
  // }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <Header />
      <Suspense>
        <Cards />
      </Suspense>
    </div>
  );
}
