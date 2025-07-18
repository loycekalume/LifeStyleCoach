import {Request} from "express"
export interface Instructor{
    instructor_id:number;
    users_id:number;
    specialization?:string;
    coaching_mode?:string;
    bio?:string;
    available_locations?:string;
    created_at?:Date;
}

export interface InstructorRequest extends Request{
    instructor?:Instructor;
}