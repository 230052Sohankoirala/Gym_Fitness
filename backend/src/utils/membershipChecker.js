import Subscription from "../models/Subscription.js";

/**
 * Checks whether a member currently has an active paid membership.
 * This follows the same active-membership logic already used in your subscription controller.
 */
export const getActiveMembership = async (userId) => {
    if (!userId) return null;

    const subscription = await Subscription.findOne({
        member: userId,
        active: true,
        status: "active",
        expiresAt: { $gt: new Date() },
    })
        .populate("trainer", "name email")
        .populate("session", "date time type status priceInCents")
        .sort({ createdAt: -1 });

    return subscription || null;
};

/**
 * Returns true if the user has an active membership.
 */
export const hasActiveMembership = async (userId) => {
    const subscription = await getActiveMembership(userId);
    return !!subscription;
};