import { rest } from "msw";

export const apiError = [
  rest.get("http://localhost/rest/topics", (req, res, ctx) => {
    return res(ctx.status(404));
  }),
  rest.get(
    "https://api.openshift.com/api/kafkas_mgmt/v1/kafkas/abc/metrics/query_range",
    (req, res, ctx) => {
      return res(ctx.status(404));
    }
  ),
];
