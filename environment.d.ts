declare namespace NodeJS {
    export interface ProcessEnv {
        readonly HTTP_BASIC_AUTH: string
        readonly MANAGEMENT_APP_API_URL: string
    }
}
