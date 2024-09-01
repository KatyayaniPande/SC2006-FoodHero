'use client';

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
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';

{
  /* Custom imports */
}
import { LOGIN_TYPES, QUERY_PARAM_NAME } from '@/lib/login/constants';
import Header from '@/components/Header';

const loginScheme = z.object({
  email: z.string().email('Email is required'),
  password: z.string(),
});

function Cards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = searchParams?.get(QUERY_PARAM_NAME) ?? '';
  const session = useSession();
  const formToRender = LOGIN_TYPES.includes(form) ? form : LOGIN_TYPES[0];

  const donorLoginForm = useForm<z.infer<typeof loginScheme>>({
    resolver: zodResolver(loginScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const beneficiaryLoginForm = useForm<z.infer<typeof loginScheme>>({
    resolver: zodResolver(loginScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const adminLoginForm = useForm<z.infer<typeof loginScheme>>({
    resolver: zodResolver(loginScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmitDonorLogin(values: z.infer<typeof loginScheme>) {
    const signin = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signin?.error) {
      donorLoginForm.setError('root', {
        type: 'manual',
        message: signin.error,
      });
      return;
    }

    if (signin?.ok) {
      const session = await getSession();

      if (session?.user.role !== 'donor') {
        signOut({ redirect: false });
        donorLoginForm.setError('root', {
          type: 'manual',
          message: 'You are not registered as a donor!',
        });
      } else {
        router.push('/donorDashboard');
      }
    }
  }

  async function onSubmitBeneficiaryLogin(values: z.infer<typeof loginScheme>) {
    const signin = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signin?.error) {
      beneficiaryLoginForm.setError('root', {
        type: 'manual',
        message: signin.error,
      });
      return;
    }

    if (signin?.ok) {
      const session = await getSession();

      if (session?.user.role !== 'beneficiary') {
        signOut({ redirect: false });
        beneficiaryLoginForm.setError('root', {
          type: 'manual',
          message: 'You are not registered as a beneficiary!',
        });
      } else {
        router.push('/beneficiaryDashboard');
      }
    }
  }

  async function onSubmitAdminLogin(values: z.infer<typeof loginScheme>) {
    const signin = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signin?.error) {
      adminLoginForm.setError('root', {
        type: 'manual',
        message: signin.error,
      });
      return;
    }

    if (signin?.ok) {
      const session = await getSession();

      if (session?.user.role !== 'admin') {
        signOut({ redirect: false });
        adminLoginForm.setError('root', {
          type: 'manual',
          message: 'You are not registered as an admin!',
        });
      } else {
        router.push('/adminDashboard');
      }
    }
  }

  /**
   * Updates the URL query parameter with the render argument.
   * This is useful for ensuring that when the user uses the back button that they will
   * be redirected back to the page which directed them to the new page in the first place.
   *
   * @param render String representing what argument to provide in the query param
   */
  function updateUrlHistory(render: string) {
    const newParams = new URLSearchParams(searchParams?.toString());
    newParams.set('type', render);
    window.history.replaceState(null, '', `?${newParams.toString()}`);
  }

  return (
    <section className='h-full w-full flex flex-col items-center'>
      <div className='container mx-auto'>
        <div className='flex flex-col items-center mb-4'>
          <Tabs defaultValue={formToRender} className='w-[75%] min-w-[512px]'>
            {/* Define the list of tabs */}
            <TabsList className='grid w-full grid-cols-3 bg-white'>
              <TabsTrigger
                className='data-[state=active]:text-white data-[state=active]:bg-[#A2C765]'
                value='donor'
                onClick={() => {
                  updateUrlHistory('donor');
                }}
              >
                Donor Login
              </TabsTrigger>
              <TabsTrigger
                className='data-[state=active]:text-white data-[state=active]:bg-[#A2C765]'
                value='beneficiary'
                onClick={() => {
                  updateUrlHistory('beneficiary');
                }}
              >
                Beneficiary Login
              </TabsTrigger>
              <TabsTrigger
                className='data-[state=active]:text-white data-[state=active]:bg-[#A2C765]'
                value='admin'
                onClick={() => {
                  updateUrlHistory('admin');
                }}
              >
                Admin Login
              </TabsTrigger>
            </TabsList>

            {/* Define the contents of the tabs here */}
            {/* Donor card */}
            <TabsContent value='donor'>
              <Card className='w-[100%] mt-4 min-w-[412px]'>
                <CardHeader>
                  <CardTitle className='pt-4'>Donor Login</CardTitle>
                  <CardDescription className='pt-2 pb-2'>
                    Enter in your email and password to your Donor account to
                    get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...donorLoginForm}>
                    <form
                      onSubmit={donorLoginForm.handleSubmit(onSubmitDonorLogin)}
                      className='flex flex-col gap-4'
                    >
                      <FormField
                        control={donorLoginForm.control}
                        name='email'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder='Email...' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={donorLoginForm.control}
                        name='password'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Password...'
                                  type='password'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {donorLoginForm.formState.errors.root && (
                        <p className='text-red-600'>
                          {donorLoginForm.formState.errors.root.message}
                        </p>
                      )}

                      {donorLoginForm.formState.isSubmitSuccessful && (
                        <p className='text-green-600'>
                          Login Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className='w-full mt-4 bg-[#A2C765] hover:bg-[#8BBE3D]'
                        type='submit'
                      >
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className='flex flex-col items-center mt-4'>
                  <p className='text-sm'>
                    Do not have a donor account yet? Click{' '}
                    <Link href='/signup?type=donor' className='underline'>
                      here
                    </Link>{' '}
                    to sign up!
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Beneficiary card */}
            <TabsContent value='beneficiary'>
              <Card className='w-[100%] mt-4 min-w-[412px]'>
                <CardHeader>
                  <CardTitle className='pt-4'>Beneficiary Login</CardTitle>
                  <CardDescription className='pt-2 pb-2'>
                    Enter in your email and password to your Donor account to
                    get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...beneficiaryLoginForm}>
                    <form
                      onSubmit={beneficiaryLoginForm.handleSubmit(
                        onSubmitBeneficiaryLogin
                      )}
                      className='flex flex-col gap-4'
                    >
                      <FormField
                        control={beneficiaryLoginForm.control}
                        name='email'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder='Email...' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={beneficiaryLoginForm.control}
                        name='password'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Password...'
                                  type='password'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {beneficiaryLoginForm.formState.errors.root && (
                        <p className='text-red-600'>
                          {beneficiaryLoginForm.formState.errors.root.message}
                        </p>
                      )}

                      {beneficiaryLoginForm.formState.isSubmitSuccessful && (
                        <p className='text-green-600'>
                          Login Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className='w-full mt-4 bg-[#A2C765] hover:bg-[#8BBE3D]'
                        type='submit'
                      >
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className='flex flex-col items-center mt-4'>
                  <p className='text-sm'>
                    Do not have a beneficiary account yet? Click{' '}
                    <Link href='/signup?type=beneficiary' className='underline'>
                      here
                    </Link>{' '}
                    to sign up!
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Admin card */}
            <TabsContent value='admin'>
              <Card className='w-[100%] mt-4 min-w-[412px]'>
                <CardHeader>
                  <CardTitle className='pt-4'>Admin Login</CardTitle>
                  <CardDescription className='pt-2 pb-2'>
                    Enter in your Administrator credentials to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...adminLoginForm}>
                    <form
                      onSubmit={adminLoginForm.handleSubmit(onSubmitAdminLogin)}
                      className='flex flex-col gap-4'
                    >
                      <FormField
                        control={adminLoginForm.control}
                        name='email'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder='Email...' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={adminLoginForm.control}
                        name='password'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Password...'
                                  type='password'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {adminLoginForm.formState.errors.root && (
                        <p className='text-red-600'>
                          {adminLoginForm.formState.errors.root.message}
                        </p>
                      )}

                      {adminLoginForm.formState.isSubmitSuccessful && (
                        <p className='text-green-600'>
                          Login Success! Redirecting...
                        </p>
                      )}

                      <Button
                        className='w-full mt-4 bg-[#A2C765] hover:bg-[#8BBE3D]'
                        type='submit'
                      >
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className='flex flex-col items-center mt-4'>
                  <p className='text-sm'>
                    Do not have an admin account yet? Click{' '}
                    <Link href='/signup?type=admin' className='underline'>
                      here
                    </Link>{' '}
                    to sign up!
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
  return (
    <div className='bg-gray-100 min-h-screen p-8'>
      <Header />
      <Suspense>
        <Cards />
      </Suspense>
    </div>
  );
}
