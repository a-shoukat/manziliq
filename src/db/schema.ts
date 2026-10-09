import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table using Firebase Auth UID as unique identifier
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('buyer'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'societies' table
export const societies = pgTable('societies', {
  id: serial('id').primaryKey(),
  societyCode: text('society_code').notNull().unique(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  location: text('location'),
  totalPlots: integer('total_plots').default(0),
  availablePlots: integer('available_plots').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'properties' table
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  propertyId: text('property_id').notNull().unique(),
  title: text('title').notNull(),
  pricePkr: integer('price_pkr').notNull(),
  sizeMarla: integer('size_marla').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(),
  societyId: text('society_id').notNull(),
  block: text('block'),
  plotNumber: text('plot_number'),
  status: text('status').default('available'),
  userId: integer('user_id').references(() => users.id),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'plots' table
export const plots = pgTable('plots', {
  id: serial('id').primaryKey(),
  plotNumber: text('plot_number').notNull(),
  societyId: text('society_id').notNull(),
  block: text('block').notNull(),
  sizeMarla: integer('size_marla').notNull(),
  status: text('status').default('available'),
  pricePkr: integer('price_pkr').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'bookings' table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingRef: text('booking_ref').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  propertyId: integer('property_id')
    .references(() => properties.id),
  amountPkr: integer('amount_pkr').notNull(),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  author: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
}));
