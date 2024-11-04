"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect } from "react-multi-select-component";
import { ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import { useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams

const Donate = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // useSearchParams to handle query params
  const [isEditMode, setIsEditMode] = useState(false);
  const [status, setStatus] = useState("");
  const [donationId, setDonationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const options = [
    { label: "Milk", value: "Milk" },
    { label: "Eggs", value: "Eggs" },
    { label: "Cheese", value: "Cheese" },
    { label: "Peanuts", value: "Peanuts" },
    { label: "Wheat", value: "Wheat" },
    { label: "Sesame", value: "Sesame" },
    { label: "Soy", value: "Soy" },
    { label: "Shellfish (E.g. Lobster, prawn, crab)", value: "Shellfish" },
    { label: "Fish", value: "Fish" },
  ];

  const cookedFormSchema = z.object({
    foodName: z.string().min(2, {
      message: "Food name must be at least 2 characters.",
    }),

    specialHandling: z.string(),
    numberOfServings: z.number().min(1, {
      message: "Number of servings must be at least 1.",
    }),
    consumeByTiming: z.string().nonempty({
      message: "Consume By Timing is required.",
    }),
    foodImages: z.array(z.instanceof(File)),
    // deliveryMethod: z.string(),
    pickUpTime: z.string().optional(),
    pickUpLocation: z.string().optional(),
    dropOffTime: z.string().optional(),
    allergens: z.array(z.string()),
  });

  const nonCookedFormSchema = z.object({
    foodName: z.string().min(2, {
      message: "Food name must be at least 2 characters.",
    }),

    foodCategory: z.string().nonempty({
      message: "Food Category is required.",
    }),
    consumeByTiming: z.string().nonempty({
      message: "Consume By Timing is required.",
    }),
    specialHandling: z.string(),
    quantity: z.number().min(1, {
      message: "Quantity of food must be at least 1.",
    }),
    foodImages: z.array(z.instanceof(File)),
    // deliveryMethod: z.string(),
    pickUpTime: z.string().optional(),
    pickUpLocation: z.string().optional(),
    dropOffTime: z.string().optional(),
  });

  const cookedForm = useForm<z.infer<typeof cookedFormSchema>>({
    resolver: zodResolver(cookedFormSchema),
    defaultValues: {
      foodName: "",
      consumeByTiming: "",
      specialHandling: "",
      numberOfServings: 0,
      foodImages: [],
      pickUpTime: "",
      pickUpLocation: "",
      dropOffTime: "",
      allergens: [],
    },
  });

  const nonCookedForm = useForm<z.infer<typeof nonCookedFormSchema>>({
    resolver: zodResolver(nonCookedFormSchema),
    defaultValues: {
      foodName: "",
      foodCategory: "",
      specialHandling: "",
      quantity: 0,
      foodImages: [],
      pickUpTime: "",
      pickUpLocation: "",
      dropOffTime: "",
    },
  });

  const [allergens, setAllergens] = useState([]);
  const [foodType, setFoodType] = useState("Non-Cooked Food");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setDonationId(id);
      setIsEditMode(true);
      fetchDonationData(id); // Fetch the existing donation data for editing
    }
  }, [searchParams]);

  const fetchDonationData = async (id: string) => {
    try {
      const response = await fetch(`/api/donation?id=${id}`); // Pass the donation ID as a query param
      if (response.ok) {
        const data = await response.json(); // Get the donation data
        // console.log("Fetched donation data:", data); // Log the data for debugging

        setStatus(data.status);

        // Check if it's Cooked Food or Non-Cooked Food and populate the correct form
        if (data.foodType === "Cooked Food") {
          cookedForm.reset({
            foodName: data.foodName,
            specialHandling: data.specialHandling,
            numberOfServings: data.numberOfServings,
            consumeByTiming: data.consumeByTiming,
            allergens: data.allergens || [],
            foodImages: [], // Handle images separately if needed
          });
          setFoodType("Cooked Food");
        } else {
          nonCookedForm.reset({
            foodName: data.foodName,
            consumeByTiming: data.consumeByTiming,
            foodCategory: data.foodCategory,
            quantity: data.quantity,
            specialHandling: data.specialHandling,
            foodImages: [], // Handle images separately if needed
          });
          setFoodType("Non-Cooked Food");
        }

        // Optionally, handle existing images by saving them in a separate state
        if (data.foodImages && data.foodImages.length > 0) {
          setPreviewImages(data.foodImages); // Assuming `foodImages` contains URLs
        }
      } else {
        console.error("Failed to fetch donation data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching donation data:", error);
    }
  };

  // Helper function to convert file to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    console.log("convertToBase64 called with file:", file.name);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1];
        console.log("Base64 String:", base64String);
        resolve(base64String || "");
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: any) {
    try {
      // Convert image files to Base64, similar to your current logic
      const base64Images = await Promise.all(
        values.foodImages.map(async (file: File) => {
          const base64String = await convertToBase64(file);
          return base64String;
        })
      );
      values.foodImages = base64Images;

      const session = await getSession();
      if (!session?.user) {
        console.error("User not found in session storage");
        return;
      }

      const data = {
        ...values,
        foodType: foodType,
        user: {
          email: session.user.email,
          agency: session.user.agency,
          // other user details...
        },
      };

      let response;
      if (isEditMode && donationId) {
        const updatedData = {
          ...data,
          status,
          id: donationId, // Add the donationId to the data
        };
        // Update existing donation (PUT request)
        response = await fetch(`/api/donation`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
      } else {
        // Create new donation (POST request)
        response = await fetch("/api/donation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "submit"} donation`
        );
      }

      const result = await response.json();
      console.log(
        `Donation ${isEditMode ? "updated" : "submitted"} successfully:`,
        result
      );

      // Reset form after successful submission/update
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewImages([]);
      if (foodType === "Cooked Food") {
        cookedForm.reset({
          // reset cooked form fields
        });
      } else {
        nonCookedForm.reset({
          // reset non-cooked form fields
        });
      }

      // Redirect to donor dashboard after saving
      router.push("/donorDashboard");
    } catch (error) {
      console.error("Error submitting donation:", error);
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log(files);
    if (files) {
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
      if (foodType === "Non-Cooked Food") {
        nonCookedForm.setValue("foodImages", files);
      } else {
        cookedForm.setValue("foodImages", files); // Store files in the form state
      }
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Navigation Bar */}
      <Header />

      {/* Form Content */}
      <section className="bg-white rounded-lg shadow-lg p-12 mb-12 flex justify-center relative">
        <div className="flex flex-col items-center w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-2">Donate Food</h1>
          <p className="text-sm text-gray-700 text-center mb-7 pt-2">
            Help us make a difference, one meal at a time. Share your food
            today!
          </p>
          <div className="absolute top-9 left-10">
            <Button
              onClick={() => router.push("/donorDashboard")}
              variant="outline"
              size="sm"
              className="flex items-center border-none"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md font-semibold ${
                foodType === "Non-Cooked Food"
                  ? "bg-custom-dark-green text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setFoodType("Non-Cooked Food")}
            >
              Non-Cooked Food
            </button>
            <button
              className={`px-4 py-2 rounded-md font-semibold ${
                foodType === "Cooked Food"
                  ? "bg-custom-dark-green text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setFoodType("Cooked Food")}
            >
              Cooked Food
            </button>
          </div>

          {foodType === "Cooked Food" ? (
            <Form key="cookedForm" {...cookedForm}>
              <form
                onSubmit={cookedForm.handleSubmit(onSubmit)}
                className="space-y-4 w-full max-w-s mx-auto"
              >
                {/* Cooked food form fields */}
                <FormField
                  control={cookedForm.control}
                  name="foodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name</FormLabel>
                      <FormControl>
                        <Input className="shadow-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cookedForm.control}
                  name="consumeByTiming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consume By Timing</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          type="datetime-local"
                          {...field}
                          min={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Adds 2 days
                            .toISOString()
                            .slice(0, 16)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cookedForm.control}
                  name="numberOfServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className="w-full shadow-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        This does not have to be accurate. An estimate will do!
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    className="rounded-md text-white bg-custom-dark-green hover:bg-custom-darker-green"
                    type="submit"
                  >
                    {isEditMode ? "Save Changes" : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form key="nonCookedForm" {...nonCookedForm}>
              <form
                onSubmit={nonCookedForm.handleSubmit(onSubmit)}
                className="space-y-4 w-full max-w-s mx-auto"
              >
                {/* Non-cooked food form fields */}
                <FormField
                  control={nonCookedForm.control}
                  name="foodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "black" }}>
                        Food Name
                      </FormLabel>
                      <FormControl>
                        <Input className="w-full shadow-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="foodCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Category</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            setSelectedCategory(value);
                            field.onChange(value); // Updates the form state
                          }}
                        >
                          <SelectTrigger className="w-full shadow-sm bg-white">
                            <SelectValue placeholder="Select Food Type" />
                          </SelectTrigger>
                          <SelectContent className="w-full bg-white">
                            <SelectItem value="Vegetables">
                              Vegetables
                            </SelectItem>
                            <SelectItem value="Canned Food">
                              Canned Food
                            </SelectItem>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity of Items</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className="w-full shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="consumeByTiming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consume By</FormLabel>

                      <FormControl>
                        <Input
                          className="shadow-sm"
                          type="datetime-local"
                          {...field}
                          min={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Adds 2 days
                            .toISOString()
                            .slice(0, 16)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="specialHandling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Special Storage/Handling Requirements
                      </FormLabel>
                      <FormControl>
                        <Input className="shadow-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    className="rounded-md text-white bg-custom-dark-green hover:bg-custom-darker-green"
                    type="submit"
                  >
                    {isEditMode ? "Save Changes" : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Donate;
