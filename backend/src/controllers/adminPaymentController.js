import Payment from "../models/Payment.js";

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

        const stats = filteredPayments.reduce(
            (acc, payment) => {
                const amountTotal = Number(payment.amountTotal || 0);
                const refundedAmount = Number(payment.refundedAmount || 0);

                acc.totalRevenue += amountTotal;
                acc.totalAdminShare += Number(payment.adminShare || 0);
                acc.totalTrainerShare += Number(payment.trainerShare || 0);
                acc.totalRefunded += refundedAmount;

                if (payment.status === "succeeded") acc.completedCount += 1;
                if (payment.status === "pending") acc.pendingCount += 1;
                if (
                    payment.status === "refunded" ||
                    payment.status === "partially_refunded"
                ) {
                    acc.refundCount += 1;
                }

                return acc;
            },
            {
                totalRevenue: 0,
                totalAdminShare: 0,
                totalTrainerShare: 0,
                totalRefunded: 0,
                completedCount: 0,
                pendingCount: 0,
                refundCount: 0,
            }
        );

        return res.status(200).json({
            success: true,
            stats,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalPaymentsCount,
                totalPages: Math.ceil(totalPaymentsCount / limitNumber),
            },
            payments: paginatedPayments,
        });
    } catch (error) {
        console.error("getAllPaymentsForAdmin error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin payments",
        });
    }
};