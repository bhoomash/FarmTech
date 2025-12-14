import { z } from 'zod';

// Email validation schema
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
});

// OTP validation schema
export const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers')
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Fertilizer', 'Seeds', 'Pesticides', 'Tools'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  price: z.number().min(0, 'Price must be positive'),
  discount: z.number().min(0).max(100, 'Discount must be between 0 and 100').optional(),
  stock: z.number().min(0, 'Stock must be positive'),
  image: z.string().url('Please provide a valid image URL')
});

// Shipping address validation schema
export const shippingAddressSchema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits')
});

// Validate data with a schema
export const validateData = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};
