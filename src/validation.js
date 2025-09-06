const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(1),
  zip: z.string().regex(/^\d{4,10}$/)
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  zip: z.string().regex(/^\d{4,10}$/).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'No fields to update' });

module.exports = { createUserSchema, updateUserSchema };
