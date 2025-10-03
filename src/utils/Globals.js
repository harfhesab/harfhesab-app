// const url = "https://project.ir";
const url = "http://192.168.43.207:4000";
export default {
    baseURL: `${url}/graphql`,
    uri: url,
    android_package_name: 'com.pod.kiosk',
    install_source: "direct", // 'direct', 'googleplay', 'cafebazaar', 'myket', 'appstore', 'sibirani', 'sibapp', 'anardoni'
    build_type: "apk",
    data: {
      configs: {
        translate: 'fa',
      },
    },
};
  