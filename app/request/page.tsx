"use client";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { useToast } from "@/components/ui/use-toast";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
  Autocomplete,
} from "@react-google-maps/api";
const Request = () => {
  const searchParams = useSearchParams(); // useSearchParams to handle query params

  const inputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB7CV-gPgdBWcYd65zzNlBzGcVxCA-I3xA",
    libraries: ["places"],
  });
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [status, setStatus] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errors, setErrors] = useState({ deliveryLocation: "" });
  const [isValidLocation, setIsValidLocation] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setRequestId(id);
      setIsEditMode(true);
      fetchRequestData(id); // Fetch the existing donation data for editing
    }
  }, [searchParams]);

  const fetchRequestData = async (id: string) => {
    try {
      const response = await fetch(`/api/request?id=${id}`); // Pass the donation ID as a query param
      if (response.ok) {
        const data = await response.json(); // Get the donation data
        // console.log("Fetched donation data:", data); // Log the data for debugging

        setStatus(data.status);

        // Check if it's Cooked Food or Non-Cooked Food and populate the correct form
        if (data.foodType === "Cooked Food") {
          cookedForm.reset({
            foodName: data.foodName,
            specialRequest: data.specialRequest,
            numberOfServings: data.numberOfServings,
            needByTime: data.needByTime,
            deliveryLocation: data.deliveryLocation,
            floorNumber: data.floorNumber,
          });
          setFoodType("Cooked Food");
        } else {
          nonCookedForm.reset({
            foodName: data.foodName,
            foodCategory: data.foodCategory,
            quantity: data.quantity,
            specialRequest: data.specialRequest,
            needByTime: data.needByTime,
            deliveryLocation: data.deliveryLocation,
            floorNumber: data.floorNumber,
          });
          setFoodType("Non-Cooked Food");
        }
      } else {
        console.error("Failed to fetch request data:", response.statusText);
      }
      setIsValidLocation(true);
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  };

  const cookedFormSchema = z.object({
    foodName: z.string().min(2, {
      message: "Food name must be at least 2 characters.",
    }),
    needByTime: z.string().nonempty({
      message: "Date/Time the food is needed by is required.",
    }),
    specialRequest: z.string(),
    numberOfServings: z.number().min(1, {
      message: "Number of servings must be at least 1.",
    }),
    // deliveryMethod: z.string(),
    // deliveryTime: z.string().optional(),
    deliveryLocation: z.string().nonempty({
      message: "Location is required.",
    }),
    floorNumber: z.string(),
  });

  const nonCookedFormSchema = z.object({
    foodName: z.string().min(2, {
      message: "Food name must be at least 2 characters.",
    }),
    needByTime: z.string().nonempty({
      message: "Date/Time the food is needed by is required.",
    }),
    foodCategory: z.string().nonempty({
      message: "Food Category is required.",
    }),
    specialRequest: z.string(),
    quantity: z.number().min(1, {
      message: "Quantity of food must be at least 1.",
    }),
    // deliveryMethod: z.string(),
    // deliveryTime: z.string().optional(),
    deliveryLocation: z.string().nonempty({
      message: "Location is required.",
    }),
    floorNumber: z.string(),
  });

  const cookedForm = useForm<z.infer<typeof cookedFormSchema>>({
    resolver: zodResolver(cookedFormSchema),
    defaultValues: {
      foodName: "",
      specialRequest: "",
      numberOfServings: 0,
      floorNumber: "",
    },
  });

  const nonCookedForm = useForm<z.infer<typeof nonCookedFormSchema>>({
    resolver: zodResolver(nonCookedFormSchema),
    defaultValues: {
      foodName: "",
      foodCategory: "",
      specialRequest: "",
      quantity: 0,
      floorNumber: "",
    },
  });

  const handleLocationChange = () => {
    const place = inputRef.current.getPlace();

    if (place && place.formatted_address) {
      if (foodType === "Cooked Food") {
        cookedForm.setValue("deliveryLocation", place.formatted_address);
      } else {
        nonCookedForm.setValue("deliveryLocation", place.formatted_address);
      }
      setErrors({ ...errors, deliveryLocation: "" });
      setIsValidLocation(true); // Set to true when a valid place is selected
    } else {
      setErrors({
        ...errors,
        deliveryLocation: "Please select a valid location from the dropdown.",
      });
      setIsValidLocation(false); // Set to false if no valid place
    }
  };

  async function onSubmit(values: any) {
    if (!isValidLocation) {
      setErrors({
        ...errors,
        deliveryLocation: "Please select a valid location from the dropdown.",
      });
      return;
    }
    // make api call to save request details in mongodb
    if (!session.data?.user) {
      // The user is not found in the session storage, should be prevented by the router
      return;
    }

    const user = {
      email: session.data?.user.email,
      agency: session.data?.user.agency,
      uen: session.data?.user.uen,
      address: session.data?.user.address,
      poc_name: session.data?.user.poc_name,
      poc_phone: session.data?.user.poc_phone,
      halal_certification: session.data?.user.halal_certification,
      hygiene_certification: session.data?.user.hygiene_certification,
      role: session.data?.user.role,
    };

    const data = {
      ...values,
      status: "new", // Set initial status to "new"
      foodType: foodType,
      user: user,
    };

    let response;

    try {
      // make api call to save request details in mongodb
      if (isEditMode && requestId) {
        const updatedData = {
          ...data,
          id: requestId, // Add the donationId to the data
        };
        response = await fetch(`/api/request`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
      } else {
        response = await fetch("/api/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to submit request: ${response.statusText}`);
      }

      const result = await response.json();

      router.push("/beneficiaryDashboard");
    } catch (error) {
      toast({
        title: "Error!",
        description:
          "Your request has failed. Please try again later. Error: " + error,
      });
    }
  }

  const [selectedCategory, setSelectedCategory] = useState("");
  const [foodType, setFoodType] = useState("Non-Cooked Food");

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Navigation Bar */}
      <Header />

      {/* Form Content */}
      <section className="bg-white rounded-lg shadow-lg p-12 mb-12 flex justify-center">
        <div className="relative w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Request for Food
          </h1>
          <p className="text-sm text-gray-700 mb-7 text-center pt-4">
            Require food for your organisation? Fill in the form below to
            request for food donations from our donors. We will do our best to
            match you with a donor as soon as possible!
          </p>
          {/* Back button aligned to the left */}
          <div className="absolute top-0 left-0">
            <Button
              onClick={() => router.push("/beneficiaryDashboard")}
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

                <FormField
                  control={cookedForm.control}
                  name="specialRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Special Requests (e.g. dietary restrictions)
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          {...field}
                          placeholder="If applicable"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cookedForm.control}
                  name="needByTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Food By</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          type="datetime-local"
                          {...field}
                          ref={(input) => {
                            if (input) {
                              // Set min date dynamically to 2 days from today
                              const currentDate = new Date();
                              const minDate = new Date(
                                currentDate.setDate(currentDate.getDate() + 2)
                              )
                                .toISOString()
                                .slice(0, 16);

                              // Set the min attribute
                              input.min = minDate;
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isLoaded && (
                  <Autocomplete
                    onLoad={(ref) => (inputRef.current = ref)}
                    onPlaceChanged={handleLocationChange} // Handling when a place is selected
                    options={{
                      componentRestrictions: { country: "SG" },
                      fields: ["address_components", "formatted_address"],
                    }}
                  >
                    <FormField
                      control={cookedForm.control}
                      name="deliveryLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Location</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setErrors({ ...errors, deliveryLocation: "" });
                                setIsValidLocation(false); // User is typing, so set to false
                              }}
                            />
                          </FormControl>
                          {errors.deliveryLocation && (
                            <p className="text-red-500 text-sm">
                              {errors.deliveryLocation}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Autocomplete>
                )}

                <FormField
                  control={cookedForm.control}
                  name="floorNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          {...field}
                          placeholder="If applicable"
                        />
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
          ) : (
            <Form key="nonCookedForm" {...nonCookedForm}>
              <form
                onSubmit={nonCookedForm.handleSubmit(onSubmit)}
                className="space-y-4 w-full max-w-s mx-auto"
              >
                <FormField
                  control={nonCookedForm.control}
                  name="foodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name</FormLabel>
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
                            <SelectValue placeholder="Select Food Category" />
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
                  name="specialRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Special Requests (e.g. dietary restrictions)
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          {...field}
                          placeholder="If applicable"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="needByTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Food By</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          type="datetime-local"
                          {...field}
                          ref={(input) => {
                            if (input) {
                              // Set min date dynamically to 2 days from today
                              const currentDate = new Date();
                              const minDate = new Date(
                                currentDate.setDate(currentDate.getDate() + 2)
                              )
                                .toISOString()
                                .slice(0, 16);

                              // Set the min attribute
                              input.min = minDate;
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isLoaded && (
                  <Autocomplete
                    onLoad={(ref) => (inputRef.current = ref)}
                    onPlaceChanged={handleLocationChange} // Handling when a place is selected
                    options={{
                      componentRestrictions: { country: "SG" },
                      fields: ["address_components", "formatted_address"],
                    }}
                  >
                    <FormField
                      control={nonCookedForm.control}
                      name="deliveryLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Location</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setErrors({ ...errors, deliveryLocation: "" });
                                setIsValidLocation(false); // User is typing, so set to false
                              }}
                            />
                          </FormControl>
                          {errors.deliveryLocation && (
                            <p className="text-red-500 text-sm">
                              {errors.deliveryLocation}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Autocomplete>
                )}

                <FormField
                  control={nonCookedForm.control}
                  name="floorNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          {...field}
                          placeholder="If applicable"
                        />
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

export default Request;
