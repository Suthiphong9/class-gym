const membershipService = require("../services/membershipService");
const { successResponse } = require("../utils/response");

const getActivePlans = async (req, res, next) => {
  try {
    const plans = await membershipService.getActivePlans();

    return successResponse(
            res,
            200,
            "Active membership plans retrieved successfully",
            plans
        );
  } catch (error) {
    next(error);
  }
};

const createMembership = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { plan_id } = req.body;

    const membership = await membershipService.createMembership(
      userId,
      Number(plan_id),
    );

    return successResponse(
            res,
            201,
            "Membership created successfully",
            membership
        );
  } catch (error) {
    next(error);
  }
};

const getMyMemberships = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberships = await membershipService.getMyMemberships(userId);

    return successResponse(
            res,
            200,
            "Memberships retrieved successfully",
            memberships
        );
  } catch (error) {
    next(error);
  }
};

const getAllMemberships = async (req, res, next) => {
  try {
    const memberships = await membershipService.getAllMemberships();

    return successResponse(
            res,
            200,
            "Memberships retrieved successfully",
            memberships
        );
  } catch (error) {
    next(error);
  }
};

const getMembershipByIdForAdmin = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const membership = await membershipService.getMembershipByIdForAdmin(id);

    return successResponse(
            res,
            200,
            "Membership retrieved successfully",
            membership
        );
  } catch (error) {
    next(error);
  }
};

const updateMembershipStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const { status } = req.body;

    const membership = await membershipService.updateMembershipStatus(
      id,
      status,
    );

    return successResponse(
            res,
            200,
            "Membership status updated successfully",
            membership
        );
  } catch (error) {
    next(error);
  }
};

const getAllPlansForAdmin = async (req, res, next) => {
  try {
    const plans = await membershipService.getAllPlansForAdmin();

    return successResponse(
            res,
            200,
            "Membership plans retrieved successfully",
            plans
        );
  } catch (error) {
    next(error);
  }
};

const createMembershipPlan = async (req, res, next) => {
  try {
    const { name, description, price, duration_days } = req.body;

    const plan = await membershipService.createMembershipPlan(
      name,
      description,
      Number(price),
      Number(duration_days),
    );

    return successResponse(
            res,
            201,
            "Membership plan created successfully",
            plan
        );
  } catch (error) {
    next(error);
  }
};

const getMembershipPlanById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const plan = await membershipService.getMembershipPlanById(id);

    return successResponse(
            res,
            200,
            "Membership plan retrieved successfully",
            plan
        );
  } catch (error) {
    next(error);
  }
};

const updateMembershipPlan = async (
    req,
    res,
    next
) => {

    try {

        const id = Number(req.params.id);

        const {
            name,
            description,
            price,
            duration_days
        } = req.body;

        const plan =
            await membershipService
                .updateMembershipPlan(
                    id,
                    name,
                    description,
                    Number(price),
                    Number(duration_days)
                );

        return successResponse(
            res,
            200,
            "Membership plan updated successfully",
            plan
        );

    } catch (error) {

        next(error);

    }
};

const updateMembershipPlanStatus = async (
    req,
    res,
    next
) => {

    try {

        const id = Number(req.params.id);

        const {
            is_active
        } = req.body;

        const plan =
            await membershipService
                .updateMembershipPlanStatus(
                    id,
                    is_active
                );

        return successResponse(
            res,
            200,
            "Membership plan status updated successfully",
            plan
        );

    } catch (error) {

        next(error);

    }
};

module.exports = {
  getActivePlans,
  createMembership,
  getMyMemberships,
  getAllMemberships,
  getMembershipByIdForAdmin,
  updateMembershipStatus,
  getAllPlansForAdmin,
  createMembershipPlan,
  getMembershipPlanById,
  updateMembershipPlan,
  updateMembershipPlanStatus
};
