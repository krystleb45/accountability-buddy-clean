describe("achievement routes", () => {
  it("GET /api/achievements ? 200 OK", async () => {
    const res = await globalThis.authGet("/api/achievements");
    expect(res.status).toBe(200);
  });
});
