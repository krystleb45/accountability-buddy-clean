describe("follow routes", () => {
  it("smoke test runs", () => {
    expect(true).toBe(true)
  })
  it("GET /api/follows ? 200 OK", async () => {
    const res = await globalThis.authGet("/api/follow")
    expect(res.status).toBe(200)
    // TODO: add more assertions here
  })
})
