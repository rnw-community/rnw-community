const { withAppBuildGradle, withAndroidManifest } = require("@expo/config-plugins");

const withGooglePay = (config) => {
  // Add Google Pay dependency to app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s?{/,
        `dependencies {
    implementation 'com.google.android.gms:play-services-wallet:19.2.0'`,
      );
    } else {
      throw new Error(
        "Unable to add Google Pay dependency to build.gradle: Kotlin build files are not supported."
      );
    }
    return config;
  });

  // Add meta-data to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Check if the meta-data already exists
    const existingMetaData = mainApplication["meta-data"]?.find(
      (metadata) => metadata.$["android:name"] === "com.google.android.gms.wallet.api.enabled"
    );

    if (!existingMetaData) {
      // Add the new meta-data
      if (!mainApplication["meta-data"]) {
        mainApplication["meta-data"] = [];
      }
      mainApplication["meta-data"].push({
        $: {
          "android:name": "com.google.android.gms.wallet.api.enabled",
          "android:value": "true",
        },
      });
    }

    return config;
  });

  return config;
};

module.exports = { withGooglePay };