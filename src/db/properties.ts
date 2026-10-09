import { db } from './index.ts';
import { properties, societies, plots, bookings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getProperties() {
  try {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getSocieties() {
  try {
    return await db.select().from(societies);
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getPlots(societyId?: string) {
  try {
    if (societyId) {
      return await db.select().from(plots).where(eq(plots.societyId, societyId));
    }
    return await db.select().from(plots);
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
