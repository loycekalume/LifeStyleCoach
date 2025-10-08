// middleware/roleGuard.ts
import { Response, NextFunction } from "express";
import { RoleRequest } from "../../utils/types/UserRolesTypes";
import asyncHandler from "../asyncHandler";

// Middleware for role-based access control
export const roleGuard = (allowedRoles: string[]) =>
    asyncHandler(async (req: RoleRequest, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role_name)) {
             res.status(403).json({ message: "Access denied: Insufficient permissions" });
             return
        }
        next();
    });


//specific Guards
export const adminGuard = roleGuard(["Admin"])
export const InstuctorGuard = roleGuard(["Instructor"])
export const dieticianGuard = roleGuard(["Dietician"])
export const userGuard=roleGuard(["User"])
export const clientGuard=roleGuard(["client"])

export const notUserGuard=roleGuard(["Admin","Instructor","Dietician"])