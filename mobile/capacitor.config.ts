import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sout.app",
  appName: "SOUT",
  webDir: "out",
  server: {
    androidScheme: "http",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
