// const url = "https://project.ir";
const url = "http://192.168.40.146:4000";
export default {
    baseURL: `${url}/graphql`,
    uri: url,
    android_package_name: 'com.pod.kiosk',
    app_version: "1.0.0",
    install_source: "direct_download",
    build_type: "apk",
    data: {
      configs: {
        translate: 'fa',
      },
    },
};
  