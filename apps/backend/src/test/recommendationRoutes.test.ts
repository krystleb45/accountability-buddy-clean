describe("recommendationRoutes routes", () => {
  it("smoke test runs", () => {
    expect(true).toBe(true)
  })
  it("GET /api/recommendations ? 200 OK", async () => {
    const res = await globalThis.authGet("/api/recommendations")
    expect(res.status).toBe(200)
  })
})
