const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

export const withApplePay = (config) =>
  withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        "AppDelegate.h",
      );

      const content = fs.readFileSync(filePath, "utf-8");
      if (!content.includes("#import <PassKit/PassKit.h>")) {
        fs.writeFileSync(filePath, `#import <PassKit/PassKit.h>\n${content}`);
      }

      return config;
    },
  ]);

