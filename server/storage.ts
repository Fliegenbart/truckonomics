import { scenarios, type Scenario, type InsertScenario } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface for scenario persistence
export interface IStorage {
  // Scenario management
  getAllScenarios(): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: number, scenario: Partial<InsertScenario>): Promise<Scenario | undefined>;
  deleteScenario(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllScenarios(): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .orderBy(desc(scenarios.createdAt));
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db
      .insert(scenarios)
      .values(insertScenario)
      .returning();
    return scenario;
  }

  async updateScenario(id: number, updateData: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const [scenario] = await db
      .update(scenarios)
      .set({
        ...updateData,
        updatedAt: new Date(),
      } as any)
      .where(eq(scenarios.id, id))
      .returning();
    return scenario || undefined;
  }

  async deleteScenario(id: number): Promise<boolean> {
    const result = await db
      .delete(scenarios)
      .where(eq(scenarios.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
