import Realm, { BSON } from "realm";

export class SubscriptionPlan extends Realm.Object<SubscriptionPlan> {
    _id!: BSON.ObjectId;
    product_id!: string;
    title?: string;
    description?: string;
    badge?: string;
    icon_image?: string;
    duration!: number;
    price!: number;
    discount_amount?: number;
    discount_percent?: number;
    order?: number;
    is_visible!: boolean;
    is_active!: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    static schema: Realm.ObjectSchema = {
        name: "SubscriptionPlan",
        primaryKey: "_id",
        properties: {
            _id: "objectId",
            product_id: "string",
            title: "string?",
            description: "string?",
            badge: "string?",
            icon_image: "string?",
            duration: "int",
            price: "int",
            discount_amount: "int?",
            discount_percent: "int?",
            order: "int?",
            is_visible: { type: "bool", default: false },
            is_active: { type: "bool", default: false },
            createdAt: "date?",
            updatedAt: "date?",
        },
    };
}