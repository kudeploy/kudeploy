import { describe, expect, it } from "vitest";

import { initialServiceFormValue, toServiceInput } from "./service-form";

describe("ServiceForm helpers", () => {
  it("includes the selected registry credential id in service input", () => {
    const value = {
      ...initialServiceFormValue(),
      name: "api",
      image: "ghcr.io/acme/api:latest",
      registryCredentialId: "123",
    };

    expect(toServiceInput(value)).toMatchObject({
      registryCredentialId: "123",
    });
  });

  it("sends null when no registry credential is selected", () => {
    const value = {
      ...initialServiceFormValue(),
      name: "api",
      image: "nginx:latest",
      registryCredentialId: null,
    };

    expect(toServiceInput(value)).toMatchObject({
      registryCredentialId: null,
    });
  });
});
