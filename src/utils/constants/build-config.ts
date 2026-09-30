type TargetStore = 'direct' | 'googleplay' | 'cafebazaar' | 'myket' | 'appstore';
type BuildType = 'apk' | 'aab';

export const CAFE_BAZAAR_RSA_KEY: string = "MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwCj2N1unwb+6ixMWB4zn6SD9BP7r/Wwu7lW0mHOV+ue8c2SroulJbJb8Cvyuue3+5GM8dZlgt/BywyeEVCQ/Yl1F04bxcFYtnXBPlssZbMQi1okqEVL124D0FWWIEUOKUaB6yqh8cAonNrTrgBZpl4b7sx9Sst8acF7b/wGW+rzvaFNuGK+DHfzOFv0NXuLGt0WV82L/8QaRVnuZtzP/F8wA+PKeZBfZJp8gUc21DsCAwEAAQ==";
export const CAFE_BAZAAR_DYNAMIC_DISCOUNT_KEY: string = "CmzsFgoxF74687pE7UJurFTGxrDwl4lQHPZkLmgXC7c";
export const MYKET_RSA_KEY: string = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9TW4Y/vaJFjrjPOjmbqsgOq/0mjR0IhV/0LInO5DoFnEs0Km0P7+73K9/hlIyeqfuCB66Vrl9JRXqVLdo4AowvVjzQu23LDBm0Ei7QZQXbWM8uJI9sIseQORiyDAft/x6FolYvG8XYECBpOTTFQZIVir3lLDyIdW+Fz1d6H8DywIDAQAB";

export const TARGET_STORE: TargetStore = "myket";

export const BUILD_TYPE: BuildType = "apk";