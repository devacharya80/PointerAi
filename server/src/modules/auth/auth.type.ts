export interface RegisterInput{
    firstName : string,
    lastName? : string,
    email : string,
    password : string
}

export interface LoginInput{
    email : string,
    password : string
}

export interface JWTPayload{
    userId : string,
    email : string
}

export interface AuthTokens{
    accessToken : string,
    refreshToken : string
}