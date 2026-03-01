type TargetStore = 'direct' | 'googleplay' | 'cafebazaar' | 'myket' | 'appstore';
type BuildType = 'apk' | 'aab';

export const CAFE_BAZAAR_RSA_KEY: string = "MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwCeJZO6AI+cihjKC1ZXdOS9SfvaKeAxZMPX1+8qKxkWS60B6/3O/Hf1oycU0/eI5dUa0rtZ6jnwiC7smhfP5jf7tXHTAk9BxpoQP5zPrT7eNhRIDrIf79AP11qqNh8OYtuzQmY9gcP7NfFHvcL8EVM5XBSJMqiXIQ0O7AiK3iqVClHxK421nVKpCiGUV1m+zQLu1EMH4dtjWduH8qaxUp1kEjWv0T2WeGGUjn4Rc8UCAwEAAQ==";
export const MYKET_RSA_KEY: string = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCinemOrBFW5eEBrrr+00j8H75jsEk1bbyxEzEDrHDOrUkWx8PMV/aA3ziJB7wNSyGxFFFtaqIWFvUiiLpv04b/b6pqCejZwovTp7386gP2EVHadWyQJtFCXrVMO/hZUKkd33+HsJc9jsF07Vizs/PPNRXgjpH0YhWKuM4tQDHA8QIDAQAB"

export const TARGET_STORE: TargetStore = "myket"; 

export const BUILD_TYPE: BuildType = "apk";