import http from "k6/http";

import { sleep, check } from "k6";

export const options = {
  vus: 10,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95) < 300"],
    http_req_failed: ["rate<0.01"],
  },

  // Use stages for load, stress, spike, soak testing
  // stages: [
  //   { duration: "30s", target: 100 },
  //   { duration: "2m", target: 100 },

  //   { duration: "1m", target: 2_000 },
  //   { duration: "10s", target: 2_000 },
  //   { duration: "1m", target: 100 },

  //   { duration: "30s", target: 0 },
  // ],
};

export default function () {
  const params = {
    headers: {
      Authorization: "Bearer ADD_LOGGED_IN_USER_TOKEN_HERE",
    },
  };
  const res = http.get("http://localhost:3030/api/v1/products", params);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "transaction time < 300ms": (r) => r.timings.duration < 300,
  });
  sleep(1);
}
