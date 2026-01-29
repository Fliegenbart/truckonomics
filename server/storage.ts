import { scenarios, type Scenario, type InsertScenario } from "@shared/schema";
import { db, hasDatabase } from "./db";
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

// In-memory storage for local development without database
export class MemoryStorage implements IStorage {
  private scenarios: Map<number, Scenario> = new Map();
  private nextId = 1;

  async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const scenario: Scenario = {
      ...insertScenario,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.scenarios.set(scenario.id, scenario);
    return scenario;
  }

  async updateScenario(id: number, updateData: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const existing = this.scenarios.get(id);
    if (!existing) return undefined;
    const updated: Scenario = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.scenarios.set(id, updated);
    return updated;
  }

  async deleteScenario(id: number): Promise<boolean> {
    return this.scenarios.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getAllScenarios(): Promise<Scenario[]> {
    return await db!
      .select()
      .from(scenarios)
      .orderBy(desc(scenarios.createdAt));
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db!
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db!
      .insert(scenarios)
      .values(insertScenario)
      .returning();
    return scenario;
  }

  async updateScenario(id: number, updateData: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const [scenario] = await db!
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
    const result = await db!
      .delete(scenarios)
      .where(eq(scenarios.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Use in-memory storage if no database is configured
export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();
