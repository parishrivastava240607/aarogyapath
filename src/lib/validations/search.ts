import { z } from "zod";

export const searchQueryParamsSchema = z.object({
  q: z.string().optional().default(""),
  lat: z.coerce.number().default(22.7196),
  lng: z.coerce.number().default(75.8577),
  radius: z.coerce.number().default(15),
  type: z.enum(["all", "govt", "private"]).default("all"),
  emergencyOnly: z.enum(["true", "false"]).default("false"),
  icuOnly: z.enum(["true", "false"]).default("false"),
  ayushmanOnly: z.enum(["true", "false"]).default("false"),
  sortBy: z.enum(["distance", "beds", "rating"]).default("distance"),
});

export type SearchQueryParams = z.infer<typeof searchQueryParamsSchema>;
