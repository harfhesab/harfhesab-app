import { BSON } from "realm";

export interface ICoinPlan {
    _id: BSON.ObjectId;
    product_id: string;
    title?: string;
    description?: string;
    badge?: string;
    icon_image?: string;
    number_coin: number;
    price: number;
    discount_amount?: number;
    discount_percent?: number;
    order?: number;
    is_visible: boolean;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}