import { Request } from "express"


export interface UserRole {
    role_id: number;
    role_name: string;
}

export interface RoleRequest extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
        role_id: number;
        role_name: string;
    }
}