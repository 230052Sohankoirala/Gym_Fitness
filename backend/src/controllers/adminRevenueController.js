import Payment from "../models/Payment.js";

export const getAdminRevenueOverview = async (req, res) => {
    try {
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startOf7DaysAgo = new Date(startOfToday);
        startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);

        const startOfPrevious7Days = new Date(startOf7DaysAgo);
        startOfPrevious7Days.setDate(startOfPrevious7Days.getDate() - 7);

        const endOfPrevious7Days = new Date(startOf7DaysAgo);
        endOfPrevious7Days.setMilliseconds(-1);

        const payments = await Payment.find({
            status: { $in: ["succeeded", "partially_refunded", "refunded"] },
            createdAt: { $gte: startOfPrevious7Days },
        }).select("amountTotal refundedAmount createdAt status");

        const dailyMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOf7DaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            dailyMap[key] = 0;
        }

        let current7Revenue = 0;
        let previous7Revenue = 0;

        for (const payment of payments) {
            const created = new Date(payment.createdAt);
            const key = created.toISOString().slice(0, 10);

            const gross = Number(payment.amountTotal || 0);
            const refunded = Number(payment.refundedAmount || 0);
            const net = Math.max(gross - refunded, 0);

            if (created >= startOf7DaysAgo && created <= now) {
                current7Revenue += net;
                if (dailyMap[key] !== undefined) {
                    dailyMap[key] += net;
                }
            } else if (created >= startOfPrevious7Days && created <= endOfPrevious7Days) {
                previous7Revenue += net;
            }
        }

        let changePercent = 0;
        if (previous7Revenue > 0) {
            changePercent = ((current7Revenue - previous7Revenue) / previous7Revenue) * 100;
        } else if (current7Revenue > 0) {
            changePercent = 100;
        }

        const points = Object.entries(dailyMap).map(([date, revenue]) => ({
            date,
            revenue,
        }));

        return res.status(200).json({
            success: true,
            revenue: {
                totalLast7Days: current7Revenue,
                previous7Days: previous7Revenue,
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