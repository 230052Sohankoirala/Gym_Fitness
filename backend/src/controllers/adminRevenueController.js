import Payment from "../models/Payment.js";

/**
 * Converts Stripe cents into normal dollar value.
 * Example:
 * 1200 => 12.00
 * 240 => 2.40
 */
const centsToDollars = (value) => {
    return Number(((Number(value || 0)) / 100).toFixed(2));
};

/**
 * Safely calculates net amount after refund.
 */
const calculateNetCents = (amountTotal, refundedAmount) => {
    const gross = Number(amountTotal || 0);
    const refunded = Number(refundedAmount || 0);

    return Math.max(gross - refunded, 0);
};

/**
 * GET /api/admin/revenue-overview
 * Admin revenue overview for the current 7 days and previous 7 days.
 */
export const getAdminRevenueOverview = async (req, res) => {
    try {
        const now = new Date();

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const startOf7DaysAgo = new Date(startOfToday);
        startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);

        const startOfPrevious7Days = new Date(startOf7DaysAgo);
        startOfPrevious7Days.setDate(startOfPrevious7Days.getDate() - 7);

        const endOfPrevious7Days = new Date(startOf7DaysAgo);
        endOfPrevious7Days.setMilliseconds(-1);

        const payments = await Payment.find({
            status: {
                $in: ["succeeded", "partially_refunded", "refunded"],
            },
            createdAt: {
                $gte: startOfPrevious7Days,
            },
        }).select("amountTotal refundedAmount createdAt status");

        const dailyMap = {};

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOf7DaysAgo);
            d.setDate(d.getDate() + i);

            const key = d.toISOString().slice(0, 10);
            dailyMap[key] = 0;
        }

        let current7RevenueCents = 0;
        let previous7RevenueCents = 0;

        for (const payment of payments) {
            const created = new Date(payment.createdAt);
            const key = created.toISOString().slice(0, 10);

            const netCents = calculateNetCents(
                payment.amountTotal,
                payment.refundedAmount
            );

            if (created >= startOf7DaysAgo && created <= now) {
                current7RevenueCents += netCents;

                if (dailyMap[key] !== undefined) {
                    dailyMap[key] += netCents;
                }
            } else if (
                created >= startOfPrevious7Days &&
                created <= endOfPrevious7Days
            ) {
                previous7RevenueCents += netCents;
            }
        }

        let changePercent = 0;

        if (previous7RevenueCents > 0) {
            changePercent =
                ((current7RevenueCents - previous7RevenueCents) /
                    previous7RevenueCents) *
                100;
        } else if (current7RevenueCents > 0) {
            changePercent = 100;
        }

        const points = Object.entries(dailyMap).map(([date, revenueCents]) => ({
            date,
            revenue: centsToDollars(revenueCents),
        }));

        return res.status(200).json({
            success: true,
            revenue: {
                totalLast7Days: centsToDollars(current7RevenueCents),
                previous7Days: centsToDollars(previous7RevenueCents),
                changePercent: Number(changePercent.toFixed(1)),
                points,
            },
        });
    } catch (error) {
        console.error("getAdminRevenueOverview error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue overview",
        });
    }
};

/**
 * GET /api/admin/payments
 * Admin can view all payment records with populated member, trainer, and session info.
 */
export const getAllPaymentsForAdmin = async (req, res) => {
    try {
        const {
            status = "all",
            page = 1,
            limit = 20,
            search = "",
        } = req.query;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.max(Number(limit) || 20, 1);
        const skip = (pageNumber - 1) * limitNumber;

        const query = {};

        if (status !== "all") {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .populate("member", "fullname fullName name email")
            .populate("trainer", "name fullName fullname email speciality")
            .populate("session", "type date time status")
            .sort({ createdAt: -1 });

        let filteredPayments = payments;

        if (search.trim()) {
            const q = search.trim().toLowerCase();

            filteredPayments = payments.filter((payment) => {
                const memberName =
                    payment?.member?.fullname ||
                    payment?.member?.fullName ||
                    payment?.member?.name ||
                    "";

                const memberEmail = payment?.member?.email || "";

                const trainerName =
                    payment?.trainer?.name ||
                    payment?.trainer?.fullName ||
                    payment?.trainer?.fullname ||
                    "";

                const trainerEmail = payment?.trainer?.email || "";
                const sessionType = payment?.session?.type || "";

                return (
                    memberName.toLowerCase().includes(q) ||
                    memberEmail.toLowerCase().includes(q) ||
                    trainerName.toLowerCase().includes(q) ||
                    trainerEmail.toLowerCase().includes(q) ||
                    sessionType.toLowerCase().includes(q)
                );
            });
        }

        const totalPaymentsCount = filteredPayments.length;

        const paginatedPayments = filteredPayments.slice(
            skip,
            skip + limitNumber
        );

        const statsInCents = filteredPayments.reduce(
            (acc, payment) => {
                const amountTotal = Number(payment.amountTotal || 0);
                const refundedAmount = Number(payment.refundedAmount || 0);
                const adminShare = Number(payment.adminShare || 0);
                const trainerShare = Number(payment.trainerShare || 0);

                const netRevenue = Math.max(amountTotal - refundedAmount, 0);

                acc.grossRevenue += amountTotal;
                acc.netRevenue += netRevenue;
                acc.totalAdminShare += adminShare;
                acc.totalTrainerShare += trainerShare;
                acc.totalRefunded += refundedAmount;

                if (payment.status === "succeeded") {
                    acc.completedCount += 1;
                }

                if (payment.status === "pending") {
                    acc.pendingCount += 1;
                }

                if (
                    payment.status === "refunded" ||
                    payment.status === "partially_refunded"
                ) {
                    acc.refundCount += 1;
                }

                return acc;
            },
            {
                grossRevenue: 0,
                netRevenue: 0,
                totalAdminShare: 0,
                totalTrainerShare: 0,
                totalRefunded: 0,
                completedCount: 0,
                pendingCount: 0,
                refundCount: 0,
            }
        );

        const stats = {
            grossRevenue: centsToDollars(statsInCents.grossRevenue),
            netRevenue: centsToDollars(statsInCents.netRevenue),

            // Keep this alias if your frontend currently uses stats.totalRevenue
            totalRevenue: centsToDollars(statsInCents.grossRevenue),

            totalAdminShare: centsToDollars(statsInCents.totalAdminShare),
            totalTrainerShare: centsToDollars(statsInCents.totalTrainerShare),
            totalRefunded: centsToDollars(statsInCents.totalRefunded),

            completedCount: statsInCents.completedCount,
            pendingCount: statsInCents.pendingCount,
            refundCount: statsInCents.refundCount,
        };

        const formattedPayments = paginatedPayments.map((payment) => {
            const paymentObject = payment.toObject();

            return {
                ...paymentObject,
                amountTotal: centsToDollars(paymentObject.amountTotal),
                adminShare: centsToDollars(paymentObject.adminShare),
                trainerShare: centsToDollars(paymentObject.trainerShare),
                refundedAmount: centsToDollars(paymentObject.refundedAmount),
                netAmount: centsToDollars(
                    calculateNetCents(
                        paymentObject.amountTotal,
                        paymentObject.refundedAmount
                    )
                ),
            };
        });

        return res.status(200).json({
            success: true,
            stats,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalPaymentsCount,
                totalPages: Math.ceil(totalPaymentsCount / limitNumber),
            },
            payments: formattedPayments,
        });
    } catch (error) {
        console.error("getAllPaymentsForAdmin error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin payments",
        });
    }
};