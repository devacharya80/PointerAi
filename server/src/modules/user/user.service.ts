import { AppError } from "../../lib/AppError.js"
import { prisma } from "../../lib/prisma.js"

export const getUser = async(userId: string) => {
    const user = await prisma.user.findUnique({
        where : {
            id : userId
        },
        select : {
            profile: true
        }
    })
    if(!user){
        throw new AppError("User not found",404)
    }
    return user
}