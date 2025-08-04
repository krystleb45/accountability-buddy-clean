describe("partner routes", () => {
  it("smoke test runs", () => {
    expect(true).toBe(true)
  })
  it("GET /api/partners ? 200 OK", async () => {
    const res = await globalThis.authGet("/api/partner")
    expect(res.status).toBe(200)
    // TODO: add more assertions here
  })
})
