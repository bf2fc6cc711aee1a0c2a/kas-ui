module.exports = {
  createServiceAccount: async (c, req, res) => {
    const clientSecret = Number.MAX_SAFE_INTEGER - new Date().getTime();
    const clientToken = new Date().getTime();
    res.status(200).json({
      clientToken: clientToken.toString(),
      clientSecret: clientSecret.toString(),
    });
  },
  createKafka: async (c, req, res) => {
    res.status(202).json({
      id: "1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      kind: "kafka",
      href: "/api/managed-services-api/v1/kafkas/1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      status: "complete",
      cloud_provider: "aws",
      multi_az: false,
      region: "us-east-1",
      owner: "api_kafka_service",
      name: "serviceapi",
      bootstrapServerHost:
        "serviceapi-1isy6rq3jki8q0otmjqfd3ocfrg.apps.ms-bttg0jn170hp.x5u8.s1.devshift.org",
      created_at: "2020-10-05T12:51:24.053142Z",
      updated_at: "2020-10-05T12:56:36.362208Z",
    });
  },

  deleteKafkaById: async (c, req, res) => {
    res.status(204).json({
      id: "1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      kind: "kafka",
      href: "/api/managed-services-api/v1/kafkas/1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      status: "complete",
      cloud_provider: "aws",
      multi_az: false,
      region: "us-east-1",
      owner: "api_kafka_service",
      name: "serviceapi",
      bootstrapServerHost:
        "serviceapi-1isy6rq3jki8q0otmjqfd3ocfrg.apps.ms-bttg0jn170hp.x5u8.s1.devshift.org",
      created_at: "2020-10-05T12:51:24.053142Z",
      updated_at: "2020-10-05T12:56:36.362208Z",
    });
  },

  getKafkaById: async (c, req, res) => {
    res.status(200).json({
      id: "1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      kind: "kafka",
      href: "/api/managed-services-api/v1/kafkas/1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
      status: "complete",
      cloud_provider: "aws",
      multi_az: false,
      region: "us-east-1",
      owner: "api_kafka_service",
      name: "serviceapi",
      bootstrapServerHost:
        "serviceapi-1isy6rq3jki8q0otmjqfd3ocfrg.apps.ms-bttg0jn170hp.x5u8.s1.devshift.org",
      created_at: "2020-10-05T12:51:24.053142Z",
      updated_at: "2020-10-05T12:56:36.362208Z",
    });
  },

  listKafkas: async (c, req, res) => {
    res.status(200).json({
      page: 1,
      size: 1,
      total: 5,
      items: [
        {
          id: "1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
          kind: "kafka",
          href:
            "/api/managed-services-api/v1/kafkas/1iSY6RQ3JKI8Q0OTmjQFd3ocFRg",
          status: "complete",
          cloud_provider: "aws",
          multi_az: false,
          region: "us-east-1",
          owner: "api_kafka_service",
          name: "serviceapi",
          bootstrapServerHost:
            "serviceapi-1isy6rq3jki8q0otmjqfd3ocfrg.apps.ms-bttg0jn170hp.x5u8.s1.devshift.org",
        },
        {
          id: "v5Sg6faQ3JKGas4hFd3og45fd31",
          kind: "kafka",
          href:
            "/api/managed-services-api/v1/kafkas/v5Sg6faQ3JKGas4hFd3og45fd31",
          status: "complete",
          cloud_provider: "aws",
          multi_az: false,
          region: "us-east-1",
          owner: "api_kafka_service",
          name: "serviceapi2",
          bootstrapServerHost:
            "serviceapi-v5Sg6faQ3JKGas4hFd3og45fd31.apps.ms-dfasf3gsds.23ds.s1.devshift.org",
        },
        {
          id: "v5Sg6faQ3JKGas4hFd3og45fd32",
          kind: "kafka",
          href:
            "/api/managed-services-api/v1/kafkas/v5Sg6faQ3JKGas4hFd3og45fd32",
          status: "failed",
          cloud_provider: "azure",
          multi_az: false,
          region: "ap-southeast-2",
          owner: "api_kafka_service",
          name: "serviceapi3",
          bootstrapServerHost:
            "serviceapi-v5Sg6faQ3JKGas4hFd3og45fd32.apps.ms-dfasf3gsds.23ds.s1.devshift.org",
        },
        {
          id: "v5Sg6faQ3JKGas4hFd3og45fd33",
          kind: "kafka",
          href:
            "/api/managed-services-api/v1/kafkas/v5Sg6faQ3JKGas4hFd3og45fd33",
          status: "accepted",
          cloud_provider: "gcp",
          multi_az: false,
          region: "ap-northeast-2",
          owner: "api_kafka_service",
          name: "serviceapi4",
          bootstrapServerHost:
            "serviceapi-v5Sg6faQ3JKGas4hFd3og45fd33.apps.ms-dfasf3gsds.23ds.s1.devshift.org",
        },
        {
          id: "v5Sg6faQ3JKGas4hFd3og45fd35",
          kind: "kafka",
          href:
            "/api/managed-services-api/v1/kafkas/v5Sg6faQ3JKGas4hFd3og45fd35",
          status: "provisioning",
          cloud_provider: "openstack",
          multi_az: false,
          region: "ap-south-1",
          owner: "api_kafka_service",
          name: "serviceapi5",
          bootstrapServerHost:
            "serviceapi-v5Sg6faQ3JKGas4hFd3og45fd35.apps.ms-dfasf3gsds.23ds.s1.devshift.org",
        }
      ],
    });
  },

  // Handling auth
  notFound: async (c, req, res) => res.status(404).json({ err: "not found" }),
  unauthorizedHandler: async (c, req, res) =>
    res.status(401).json({ err: "unauthorized" }),
};
