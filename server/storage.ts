// No persistent storage needed for this application
// All calculations are performed on-demand

export interface IStorage {
  // This application doesn't require data persistence
  // All TCO calculations are stateless
}

export class MemStorage implements IStorage {
  constructor() {
    // No state needed for stateless calculations
  }
}

export const storage = new MemStorage();
