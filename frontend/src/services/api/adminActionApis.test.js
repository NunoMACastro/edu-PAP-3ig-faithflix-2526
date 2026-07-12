/**
 * @file Contratos dos clientes API usados pelas ações administrativas F5.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { biblicalPassagesApi } from "./biblicalPassagesApi.js";
import { catalogApi } from "./catalogApi.js";
import { charitiesApi } from "./charitiesApi.js";
import { integrationsApi } from "./integrationsApi.js";

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({ apiClient: clientMocks }));
vi.mock("../../config/env.js", () => ({
  env: { apiBaseUrl: "https://api.faithflix.test" },
}));

describe("clientes API das ações administrativas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propaga paginação e signal nas leituras", () => {
    const controller = new AbortController();

    biblicalPassagesApi.listAdmin(
      { page: 2, limit: 50 },
      { signal: controller.signal },
    );
    charitiesApi.listApplications(
      { status: "pending", page: 3, limit: 20 },
      { signal: controller.signal },
    );
    integrationsApi.listIntegrations({ signal: controller.signal });
    catalogApi.listAdmin(
      { search: "Esperança", status: "draft", type: "movie", mediaStatus: "failed", sort: "title", direction: "asc", page: 2, limit: 20 },
      { signal: controller.signal },
    );
    catalogApi.getAdminContent("content/1", { signal: controller.signal });
    catalogApi.getAdminEditorOptions({ signal: controller.signal });
    catalogApi.listAdminTaxonomies(
      { search: "Família", status: "active", page: 1, limit: 20 },
      { signal: controller.signal },
    );
    charitiesApi.lookupAdminCharities("Coração & Vida", { signal: controller.signal });
    charitiesApi.previewDistribution("2026-06", { signal: controller.signal });

    expect(clientMocks.get).toHaveBeenNthCalledWith(
      1,
      "/api/biblical-passages/admin?page=2&limit=50",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      2,
      "/api/charities/applications?status=pending&page=3&limit=20",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      3,
      "/api/admin/integrations",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      4,
      "/api/catalog/admin?search=Esperan%C3%A7a&status=draft&type=movie&mediaStatus=failed&sort=title&direction=asc&page=2&limit=20",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      5,
      "/api/catalog/admin/content%2F1",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      6,
      "/api/catalog/admin/options",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      7,
      "/api/catalog/taxonomies/admin?search=Fam%C3%ADlia&status=active&page=1&limit=20",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      8,
      "/api/charities/admin/lookup?search=Cora%C3%A7%C3%A3o+%26+Vida&page=1&limit=10",
      { signal: controller.signal },
    );
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      9,
      "/api/charities/pool/distributions/2026-06/preview",
      { signal: controller.signal },
    );
  });

  it("codifica identificadores e propaga signal nas mutações", () => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    biblicalPassagesApi.unlinkFromContent("content/1", "passage/1", options);
    charitiesApi.reviewApplication(
      "application/1",
      { decision: "approved" },
      options,
    );
    charitiesApi.linkUserToCharity("charity/1", "user-1", options);
    integrationsApi.updateIntegration(
      "integration/1",
      { enabled: false, mode: "disabled" },
      options,
    );
    charitiesApi.runDistribution("2026-06", "a".repeat(64), options);
    catalogApi.updateTaxonomy("taxonomy/1", { name: "Família", expectedVersion: 1 }, options);
    catalogApi.updateTaxonomyStatus("taxonomy/1", "archived", 2, options);

    expect(clientMocks.del).toHaveBeenCalledWith(
      "/api/catalog/content%2F1/biblical-passages/passage%2F1",
      options,
    );
    expect(clientMocks.patch).toHaveBeenNthCalledWith(
      1,
      "/api/charities/applications/application%2F1/review",
      { decision: "approved" },
      options,
    );
    expect(clientMocks.patch).toHaveBeenCalledWith(
      "/api/catalog/taxonomies/taxonomy%2F1",
      { name: "Família", expectedVersion: 1 },
      options,
    );
    expect(clientMocks.patch).toHaveBeenCalledWith(
      "/api/catalog/taxonomies/taxonomy%2F1/status",
      { status: "archived", expectedVersion: 2 },
      options,
    );
    expect(clientMocks.post).toHaveBeenCalledWith(
      "/api/charities/charity%2F1/members",
      { userId: "user-1" },
      options,
    );
    expect(clientMocks.post).toHaveBeenCalledWith(
      "/api/charities/pool/distributions",
      { month: "2026-06", previewToken: "a".repeat(64) },
      options,
    );
    expect(clientMocks.patch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/integrations/integration%2F1",
      { enabled: false, mode: "disabled" },
      options,
    );
  });
});
