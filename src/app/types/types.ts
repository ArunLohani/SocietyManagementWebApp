export type LoginRequestData = {

    email: string,
    password: string


}

export type AuthResponse = {

    success: boolean,
    message: string,
    data: LoginSuccessData
}

export type LoginSuccessData = {
    token: string,
    user: User
}

export type User = {
    id: number,
    name: string,
    email:string,
    roles:Array<string>
}

export type RegisterRequestData = {
    name : string,
    email:string,
    password : string,
    phoneNumber:string,
    roles:Array<string>
}

export type JwtPayload = {

    email : string,
    id : string
}