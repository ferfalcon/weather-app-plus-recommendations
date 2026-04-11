import { z } from "zod";

export const locationOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  region: z.string().min(1).optional(),
  country: z.string().min(1),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  timezone: z.string().min(1),
});

export const locationSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

export const locationSearchResponseSchema = z.array(locationOptionSchema);

export type LocationOption = z.infer<typeof locationOptionSchema>;
export type LocationSearchQuery = z.infer<typeof locationSearchQuerySchema>;
export type LocationSearchResponse = z.infer<typeof locationSearchResponseSchema>;
