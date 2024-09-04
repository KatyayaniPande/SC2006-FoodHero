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
import { useRouter } from "next/navigation";

const Donate = () => {
  const router = useRouter();
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
    timePrepared: z.string().nonempty({
      message: "Date and Time of Preparation is required.",
    }),
    specialHandling: z.string(),
    numberOfServings: z.number().min(1, {
      message: "Number of servings must be at least 1.",
    }),
    consumeByTiming: z.string().nonempty({
      message: "Consume By Timing is required.",
    }),
    foodImages: z.array(z.instanceof(File)),
    deliveryMethod: z.string(),
    pickUpTime: z.string().optional(),
    pickUpLocation: z.string().optional(),
    dropOffTime: z.string().optional(),
    allergens: z.array(z.string()),
  });

  const nonCookedFormSchema = z.object({
    foodName: z.string().min(2, {
      message: "Food name must be at least 2 characters.",
    }),
    bestBeforeDate: z.string().nonempty({
      message: "Best Before Date is required.",
    }),
    foodCategory: z.string().nonempty({
      message: "Food Category is required.",
    }),
    specialHandling: z.string(),
    quantity: z.number().min(1, {
      message: "Quantity of food must be at least 1.",
    }),
    foodImages: z.array(z.instanceof(File)),
    deliveryMethod: z.string(),
    pickUpTime: z.string().optional(),
    pickUpLocation: z.string().optional(),
    dropOffTime: z.string().optional(),
  });

  const cookedForm = useForm<z.infer<typeof cookedFormSchema>>({
    resolver: zodResolver(cookedFormSchema),
    defaultValues: {
      foodName: "",
      timePrepared: "",
      consumeByTiming: "",
      specialHandling: "",
      numberOfServings: 0,
      foodImages: [],
      deliveryMethod: "",
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
      bestBeforeDate: "",
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
  useEffect(() => {
    cookedForm.setValue(
      "allergens",
      allergens.map((item) => item["value"])
    );
  }, [allergens]);

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
    console.log(values);

    // Convert image files to Base64
    const base64Images = await Promise.all(
      values.foodImages.map(async (file: File) => {
        const base64String = await convertToBase64(file);
        console.log(base64String);
        return base64String;
      })
    );
    values.foodImages = base64Images;

    const session = await getSession();
    //     console.log(session?.user)

    // make api call to save donation details in mongodb
    if (!session?.user) {
      console.error("User not found in session storage");
      return;
    }
    // const parsedUser = JSON.parse(session.user);
    // console.log(session.user.email);

    // we need to retrieve the details from session.user and create a dictionary then pass into JSON input
    const data = {
      ...values,
      user: {
        email: session.user.email,
        agency: session.user.agency,
        address: session.user.address,
        poc_name: session.user.poc_name,
        poc_phone: session.user.poc_phone,
        halal_certification: session.user.halal_certification,
        hygeience_certification: session.user.hygiene_certification,
        role: session.user.role,
      },
      foodType: foodType,
    };
    console.log(data);

    try {
      // make api call to save donation details in mongodb
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit donation: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Donation submitted successfully: ", result);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (foodType === "Cooked Food") {
        cookedForm.reset({
          foodName: "",
          timePrepared: "",
          specialHandling: "",
          numberOfServings: 0,
          deliveryMethod: "",
          foodImages: [],
        });
        setPreviewImages([]);
      } else {
        nonCookedForm.reset({
          foodName: "",
          bestBeforeDate: "",
          foodCategory: "",
          specialHandling: "",
          quantity: 0,
          deliveryMethod: "",
          foodImages: [],
        });
        setSelectedCategory("");
        setPreviewImages([]);
      }
      // Redirect to donor dashboard
    router.push("/donorDashboard");
    } catch (error) {
      console.error("Error submitting donation: ", error);
    }
  }

  const [selectedCategory, setSelectedCategory] = useState("");
  const [foodType, setFoodType] = useState("Non-Cooked Food");
  const [previewImages, setPreviewImages] = useState<string[]>([]);

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
          <p className="text-sm text-gray-700 mb-7">
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
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setFoodType("Non-Cooked Food")}
            >
              Non-Cooked Food
            </button>
            <button
              className={`px-4 py-2 rounded-md font-semibold ${
                foodType === "Cooked Food"
                  ? "bg-green-600 text-white"
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
                {/* Information Card */}
                <div className="bg-green-100 p-9 rounded-lg shadow-lg">
                  <p className="text-gray-700 mb-2">
                    To better protect businesses from liability for any deaths
                    or health issues resulting from the consumption of cooked
                    food donated under certain conditions, kindly provide us
                    with the following:
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 mb-2">
                    <li>
                      Details on how to ensure the food remains safe, such as
                      specific defrosting or storing instructions
                    </li>
                    <li>Time limit for consuming the food</li>
                  </ul>
                  <br></br>
                  <p className="text-gray-700">
                    Please also take all reasonable measures to comply with food
                    safety and hygiene requirements. This is in line with the{" "}
                    <a
                      href="https://sso.agc.gov.sg/Bills-Supp/22-2024/Published/20240702?DocDate=20240702"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Good Samaritan Food Donation Bill
                    </a>
                    .
                  </p>
                </div>
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
                  name="timePrepared"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date and Time of Preparation</FormLabel>
                      <FormControl>
                        <Input
                          className="shadow-sm"
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cookedForm.control}
                  name="allergens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergens</FormLabel>
                      <FormControl>
                        <div className="flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <MultiSelect
                            className="w-full h-full"
                            options={options}
                            value={allergens}
                            onChange={setAllergens}
                            labelledBy="Select"
                          />
                        </div>
                      </FormControl>
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

                <FormField
                  control={cookedForm.control}
                  name="foodImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Images</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          ref={fileInputRef}
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          onChange={handleFileChange}
                        />
                      </FormControl>
                      <FormMessage />
                      {previewImages.length > 0 && (
                        <div className="flex justify-center my-4">
                          <Carousel
                            opts={{
                              align: "center",
                            }}
                            className="w-full max-w-sm"
                          >
                            <CarouselContent>
                              {previewImages.map((src, index) => (
                                <CarouselItem
                                  key={index}
                                  // className={`md:basis-${12 / Math.min(previewImages.length, 3)} lg:basis-${12 / Math.min(previewImages.length, 3)}`}
                                >
                                  <div className="p-1">
                                    <Image
                                      src={src}
                                      object-fit="contain"
                                      width={244}
                                      height={244}
                                      alt={`Food preview ${index + 1}`}
                                      className="w-full h-auto rounded-md"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious type="button" />
                            <CarouselNext type="button" />
                          </Carousel>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={cookedForm.control}
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

                <FormField
                  control={cookedForm.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Delivery Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Scheduled Pickup" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Scheduled Pickup
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="Self-Delivery" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Self-Delivery
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {cookedForm.watch("deliveryMethod") === "Scheduled Pickup" && (
                  <>
                    <FormField
                      control={cookedForm.control}
                      name="pickUpLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input className="shadow-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={cookedForm.control}
                      name="pickUpTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Pickup Time</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {cookedForm.watch("deliveryMethod") === "Self-Delivery" && (
                  <>
                    <FormField
                      control={cookedForm.control}
                      name="dropOffTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drop Off Time</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription className="text-gray-500">
                            Our address is 218 Pandan Loop, Level 6, Singapore
                            128408. We are open from 9.30am - 6pm from Mondays
                            to Fridays and 10am - 5pm on Saturdays.{" "}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex justify-end ">
                  <Button type="submit">Submit</Button>
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
                          <SelectTrigger className="w-full shadow-sm">
                            <SelectValue placeholder="Select Food Type" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
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
                  name="bestBeforeDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best Before Date</FormLabel>
                      <FormControl>
                        <Input className="shadow-sm" type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={nonCookedForm.control}
                  name="foodImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Images</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          ref={fileInputRef}
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          onChange={handleFileChange}
                        />
                      </FormControl>
                      <FormMessage />
                      {previewImages.length > 0 && (
                        <div className="flex justify-center my-4">
                          <Carousel
                            opts={{
                              align: "center",
                            }}
                            className="w-full max-w-sm"
                          >
                            <CarouselContent>
                              {previewImages.map((src, index) => (
                                <CarouselItem
                                  key={index}
                                  // className={`md:basis-${12 / Math.min(previewImages.length, 3)} lg:basis-${12 / Math.min(previewImages.length, 3)}`}
                                >
                                  <div className="p-1">
                                    <Image
                                      src={src}
                                      object-fit="contain"
                                      width={244}
                                      height={244}
                                      alt={`Food preview ${index + 1}`}
                                      className="w-full h-auto rounded-md"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious type="button" />
                            <CarouselNext type="button" />
                          </Carousel>
                        </div>
                      )}
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

                <FormField
                  control={nonCookedForm.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Delivery Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="pickup" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Scheduled Pickup
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <RadioGroupItem value="selfDeliver" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Self-Delivery
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {nonCookedForm.watch("deliveryMethod") === "pickup" && (
                  <>
                    <FormField
                      control={nonCookedForm.control}
                      name="pickUpLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input className="shadow-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nonCookedForm.control}
                      name="pickUpTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Pickup Time</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {nonCookedForm.watch("deliveryMethod") === "selfDeliver" && (
                  <>
                    <FormField
                      control={nonCookedForm.control}
                      name="dropOffTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drop Off Time</FormLabel>
                          <FormControl>
                            <Input
                              className="shadow-sm"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Our address is 218 Pandan Loop, Level 6, Singapore
                            128408. We are open from 9.30am - 6pm from Mondays
                            to Fridays and 10am - 5pm on Saturdays.{" "}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end">
                  <Button type="submit">Submit</Button>
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
