'use client';
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import SignUp from '@/app/(auth)/sign-up/page';
import { useRouter } from 'next/navigation';
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions';
import PlaidLink from './PlaidLink';



const AuthForm=({type}:{type:string})=> {
    const router=useRouter();
    const[user,setUser]=useState(null);
    const [isLoading,setIsLoading]=useState(false);
    
    const formSchema =authFormSchema(type);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password:""
        },
      })
    // 2. Define a submit handler.
      const onSubmit = async(data: z.infer<typeof formSchema>) =>{
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true);
         
       try{
        //sign up with Appwrite & create Plaid link token
        
        if(type==='sign-up'){
          const userData ={
            firstName:data.firstName!,
            lastName:data.lastName!,
            address1:data.address1!,
            city:data.city!,
            state:data.state!,
            postalCode:data.postalCode!,
            dateOfBirth:data.dateOfBirth!,
            ssn:data.ssn!,
            email:data.email,
            password:data.password
          }
          
            const newUser= await signUp(userData);
            setUser(newUser);

        }
        if(type==='sign-in'){
             const response =await signIn({
             email:data.email,
            password:data.password

         })

           if( response) router.push('/')


        }
        
       }catch(error){
        console.error(error);
       }finally{
        setIsLoading(false);
       }
       

        //console.log(values)
       // setIsLoading(false);
      }
    

  return (
    <section className="auth-form">
        <header className='flex flex-col gap-5 md:gap-8'>
        <Link href="/" className=" cursor-pointer flex items-center gap-1 ">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
           
          />
          <h1 className="text-26px font-ibm-plex-serif font-bold text-black-1">Horizonal</h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
            <h1 className='text-26 lg:text-36 font-semibold text-gray-900'>
                {user
                 ? 'Link Account'
                 : type ==='sign-in'
                  ? 'Sign In'
                  :'Sign Up'
                }
                <p className='text-16 font-normal text-gray-600'>
                    {user
                     ?'Link your account to get started'
                     :'Please enter your details'
                    }

                </p>
            </h1>

        </div>

        </header>

        {user ? (
            <div className='flex flex-cal gap-4'>
              <PlaidLink user={user} variant="primary"/>
            </div>
        ):(
            <>
                <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        {type==='sign-up'&&(
            <>
  <div className='flex gap-4'>
  <CustomInput control={form.control} name="firstName" lable="First Name" placeholder="Enter your First Name"/>
  <CustomInput control={form.control} name="lastName" lable="Last Name" placeholder="Enter your Last Name"/>
  </div>
  <CustomInput control={form.control} name="address1" lable="Address" placeholder="Enter your Address"/>
  <CustomInput control={form.control} name="city" lable="City" placeholder="Enter your city"/>
  <div className='flex gap-4'>
  <CustomInput control={form.control} name="state" lable="State" placeholder="Example NY"/>
  <CustomInput control={form.control} name="postalCode" lable="Postal Code" placeholder="Example :111"/>
  </div>
  <div className='flex gap-4'>
  <CustomInput control={form.control} name="dateOfBirth" lable="Date of birth" placeholder="YYYY-MM-DD"/>
  <CustomInput control={form.control} name="ssn" lable="SSN" placeholder="Eample: 784-"/>
   </div>



            </>

        )}
         <CustomInput control={form.control} name="email" lable="Email" placeholder="Enter your email"/>
         <CustomInput control={form.control} name="password" lable="Password" placeholder="Enter your Password"/>
         <div className="flex flex-col gap-4">
         <Button type="submit" className='form-btn' disabled={isLoading} >{isLoading ?(
            <>
            <Loader2 size={20} className='animate-spain' /> &nbsp;
            loading...
            </>
        ): type==='sign-in' ?'Sign In' :'Sign Up'   }
        
        </Button>
        </div>
      </form>
    </Form>
            <footer className='flex justify-center gap-1'>
                <p className='text-14 font-normal text-gray-600'>
                    {type === 'sign-in' 
                    ?"Dont have any account "
                    :"Already have account "
                    }
                    </p>
                    <Link href={type ==='sign-in'?'/sign-up':'/sign-in'}className='form-link'>
                    {type==='sign-in' ?'Sign Up' :'Sign In'} 


                    </Link>
                
            </footer>
            </>
       )}

     
    </section>
  )
}

export default AuthForm