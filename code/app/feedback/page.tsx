'use client';  // Ensure that this component runs on the client side

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Use 'next/navigation' for the App Router
import { getSession } from 'next-auth/react';  // For session management
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';  // Assuming Header is located in this path

// Define the schema for form validation
const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message cannot be empty'),
});

function FeedbackForm() {
  const [showModal, setShowModal] = useState(false);  // State to handle modal visibility
  const [role, setRole] = useState<string | null>(null);  // State for user role
  const router = useRouter();  // For navigation
  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Fetch session to determine user role
  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      if (session?.user) {
        setRole(session.user.role);  // Set the role (donor/beneficiary) from session
      }
    }
    fetchSession();
  }, []);

  // Submit function
  async function onSubmitFeedback(values: z.infer<typeof feedbackSchema>) {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Show the success modal
        setShowModal(true);
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Function to close the modal and navigate to the correct dashboard based on role
  const goToDashboard = () => {
    setShowModal(false);
    if (role === 'donor') {
      router.push('/donorDashboard');  // Navigate to donor dashboard
    } else if (role === 'beneficiary') {
      router.push('/beneficiaryDashboard');  // Navigate to beneficiary dashboard
    } else {
      router.push('/');  // Fallback: navigate to the homepage if no role is found
    }
  };

  return (
    <>
      <div className='bg-gray-100 min-h-screen p-8'>
        <Header />
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="w-full mt-4 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="pt-4 text-3xl text-custom-dark-green font-bold">Feedback Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...feedbackForm}>
                <form
                  onSubmit={feedbackForm.handleSubmit(onSubmitFeedback)}
                  className="flex flex-col gap-6"
                >
                  {/* Name Field */}
                  <FormField
                    control={feedbackForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={feedbackForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject Field */}
                  <FormField
                    control={feedbackForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter subject" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Field */}
                  <FormField
                    control={feedbackForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your message"
                            rows={6}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    className="w-full mt-4 bg-custom-dark-green hover:bg-custom-darker-green text-white py-3 rounded-lg"
                    type="submit"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>

            {/* Footer Message */}
            <CardFooter className="flex justify-center mt-4">
              <p className="text-gray-500">Thank you for your feedback!</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm">
            <h2 className="text-2xl font-semibold text-custom-dark-green mb-4">Feedback Submitted Successfully!</h2>
            <p className="mb-6 text-gray-700">Thank you for your feedback.</p>
            <Button
              className="bg-custom-dark-green hover:bg-custom-darker-green text-white py-2 px-4 rounded-lg"
              onClick={goToDashboard}
            >
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default FeedbackForm;
