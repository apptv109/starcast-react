import React from 'react';
import { useForm } from 'react-hook-form';

const SignupForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
      {/* Signup form content will be implemented here */}
    </form>
  );
};

export default SignupForm; 