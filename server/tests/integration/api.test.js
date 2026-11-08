import { describe, it, expect } from "vitest";
const request = require("supertest");
const app = require("../../src/server");

describe("API Integration Smoke Tests", () => {
  it("GET /api/health responds with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("GET /api/exercises returns seeded exercise catalog", async () => {
    const res = await request(app).get("/api/exercises");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.exercises)).toBe(true);
    expect(res.body.data.exercises.length).toBeGreaterThan(0);
  });

  it("GET /api/exercises with filter returns matching subset", async () => {
    const res = await request(app).get("/api/exercises?muscleGroup=chest");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.exercises.forEach((ex) => {
      expect(ex.muscleGroup.toLowerCase()).toBe("chest");
    });
  });

  it("POST /api/auth/register fails with missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
