import { describe, expect, it } from "vitest";
import { validateAndNormaliseUrl } from "@/lib/security/url";

function expectCode(code: string) {
  return expect.objectContaining({ code });
}

describe("validateAndNormaliseUrl", () => {
  it("accepts https URL", () => {
    const url = validateAndNormaliseUrl("https://example.com");
    expect(url.href).toBe("https://example.com/");
    expect(url.protocol).toBe("https:");
  });

  it("accepts http URL", () => {
    const url = validateAndNormaliseUrl("http://example.com/path");
    expect(url.protocol).toBe("http:");
    expect(url.pathname).toBe("/path");
  });

  it("rejects javascript: protocol", () => {
    expect(() => validateAndNormaliseUrl("javascript:alert(1)")).toThrowError(
      expectCode("BLOCKED_URL"),
    );
  });

  it("rejects file: protocol", () => {
    expect(() => validateAndNormaliseUrl("file:///etc/passwd")).toThrowError(
      expectCode("BLOCKED_URL"),
    );
  });

  it("rejects ftp: protocol", () => {
    expect(() => validateAndNormaliseUrl("ftp://example.com")).toThrowError(
      expectCode("BLOCKED_URL"),
    );
  });

  it("rejects bare hostname without protocol", () => {
    expect(() => validateAndNormaliseUrl("example")).toThrowError(
      expectCode("INVALID_URL"),
    );
  });

  it("rejects empty string", () => {
    expect(() => validateAndNormaliseUrl("")).toThrowError(
      expectCode("INVALID_URL"),
    );
  });

  it("rejects URL with embedded credentials", () => {
    expect(() =>
      validateAndNormaliseUrl("http://user:pass@example.com"),
    ).toThrowError(expectCode("BLOCKED_URL"));
  });

  it("strips default HTTP port", () => {
    const url = validateAndNormaliseUrl("http://example.com:80/path");
    expect(url.port).toBe("");
  });

  it("strips default HTTPS port", () => {
    const url = validateAndNormaliseUrl("https://example.com:443/path");
    expect(url.port).toBe("");
  });
});
