export const typeDefs = `#graphql
  type ScanResult {
    domain: String!
    scannedAt: String!
  }

  type Query {
    scan(domain: String!): ScanResult
  }
`;

export const resolvers = {
  Query: {
    scan: async (_: unknown, { domain }: { domain: string }) => ({
      domain,
      scannedAt: new Date().toISOString(),
      note: "GraphQL endpoint placeholder — use REST /api/scan for full results",
    }),
  },
};
