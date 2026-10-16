const pool = require("../config/db");
const AppError = require("../errors/AppError");

const getActivePlans = async () => {
  const [plans] = await pool.query(
    `SELECT
        id,
        name,
        description,
        price,
        duration_days,
        is_active,
        created_at
        FROM membership_plans
        WHERE is_active = TRUE
        ORDER BY price ASC`,
  );

  return plans;
};

const createMembership = async (userId, planId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE user_memberships
     SET status = 'expired'
     WHERE user_id = ?
     AND status = 'active'
     AND end_date < CURDATE()`,
      [userId],
    );

    // 1. ตรวจสอบ Plan
    const [plans] = await connection.query(
      `SELECT
                id,
                name,
                price,
                duration_days,
                is_active
             FROM membership_plans
             WHERE id = ?
             FOR UPDATE`,
      [planId],
    );

    if (plans.length === 0) {
      throw new AppError("Membership plan not found", 404);
    }

    const plan = plans[0];

    // 2. ตรวจว่า Plan เปิดใช้งานหรือไม่
    if (!plan.is_active) {
      throw new AppError("Membership plan is not active", 400);
    }

    // 3. ตรวจว่า User มี Active Membership อยู่หรือไม่
    const [activeMemberships] = await connection.query(
      `SELECT
                    id,
                    start_date,
                    end_date
                 FROM user_memberships
                 WHERE user_id = ?
                 AND status = 'active'
                 FOR UPDATE`,
      [userId],
    );

    if (activeMemberships.length > 0) {
      throw new AppError("You already have an active membership", 400);
    }

    // 4. กำหนดวันที่เริ่ม
    const startDate = new Date();

    // 5. คำนวณวันหมดอายุ
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + plan.duration_days);

    // 6. INSERT Membership
    const [result] = await connection.query(
      `INSERT INTO user_memberships
                (
                    user_id,
                    plan_id,
                    start_date,
                    end_date,
                    status
                )
                VALUES (?, ?, ?, ?, 'active')`,
      [userId, planId, startDate, endDate],
    );

    // 7. ดึงข้อมูล Membership ที่สร้าง
    const [memberships] = await connection.query(
      `SELECT
                    um.id,
                    um.user_id,

                    u.username,
                    u.email,

                    um.plan_id,

                    mp.name AS plan_name,
                    mp.price,
                    mp.duration_days,

                    um.start_date,
                    um.end_date,
                    um.status,

                    um.created_at

                 FROM user_memberships um

                 JOIN users u
                    ON um.user_id = u.id

                 JOIN membership_plans mp
                    ON um.plan_id = mp.id

                 WHERE um.id = ?`,
      [result.insertId],
    );

    await connection.commit();

    return memberships[0];
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const getMyMemberships = async (userId) => {
  const [memberships] = await pool.query(
    `SELECT
            um.id,
            um.user_id,

            mp.id AS plan_id,
            mp.name AS plan_name,
            mp.description AS plan_description,
            mp.price,
            mp.duration_days,

            um.start_date,
            um.end_date,
            um.status,
            um.created_at

         FROM user_memberships um

         JOIN membership_plans mp
            ON um.plan_id = mp.id

         WHERE um.user_id = ?

         ORDER BY um.created_at DESC`,
    [userId],
  );

  return memberships;
};

const getAllMemberships = async () => {
  const [memberships] = await pool.query(
    `SELECT
            um.id,
            um.user_id,

            u.username,
            u.email,

            um.plan_id,
            mp.name AS plan_name,
            mp.price,
            mp.duration_days,

            um.start_date,
            um.end_date,
            um.status,

            um.created_at

         FROM user_memberships um

         JOIN users u
            ON um.user_id = u.id

         JOIN membership_plans mp
            ON um.plan_id = mp.id

         ORDER BY um.created_at DESC`,
  );

  return memberships;
};

const getMembershipByIdForAdmin = async (id) => {
  const [memberships] = await pool.query(
    `SELECT
            um.id,
            um.user_id,

            u.username,
            u.email,

            um.plan_id,
            mp.name AS plan_name,
            mp.description AS plan_description,
            mp.price,
            mp.duration_days,

            um.start_date,
            um.end_date,
            um.status,

            um.created_at

         FROM user_memberships um

         JOIN users u
            ON um.user_id = u.id

         JOIN membership_plans mp
            ON um.plan_id = mp.id

         WHERE um.id = ?`,
    [id],
  );

  if (memberships.length === 0) {
    throw new AppError("Membership not found", 404);
  }

  return memberships[0];
};

const updateMembershipStatus = async (id, status) => {

  const allowedStatuses = [
        "active",
        "expired",
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new AppError(
            "Invalid membership status",
            400
        );
    }

  const [memberships] = await pool.query(
    `SELECT
            id,
            status
         FROM user_memberships
         WHERE id = ?`,
    [id],
  );

  if (memberships.length === 0) {
    throw new AppError("Membership not found", 404);
  }

  const membership = memberships[0];

  if (membership.status === "cancelled") {
    throw new AppError("Membership is already cancelled", 400);
  }

  if (membership.status === "expired") {
    throw new AppError("Expired membership cannot be cancelled", 400);
  }

  await pool.query(
    `UPDATE user_memberships
         SET status = ?
         WHERE id = ?`,
    [status, id],
  );

  const [updatedMemberships] = await pool.query(
    `SELECT
                um.id,
                um.user_id,
                u.username,
                u.email,

                um.plan_id,
                mp.name AS plan_name,

                um.start_date,
                um.end_date,
                um.status,
                um.created_at

             FROM user_memberships um

             JOIN users u
                ON um.user_id = u.id

             JOIN membership_plans mp
                ON um.plan_id = mp.id

             WHERE um.id = ?`,
    [id],
  );

  return updatedMemberships[0];
};

const getAllPlansForAdmin = async () => {
  const [plans] = await pool.query(
    `SELECT
    id,
    name,
    description,
    price,
    duration_days,
    is_active,
    created_at
    FROM membership_plans
    ORDER BY created_at DESC`,
  );

  return plans;
};

const createMembershipPlan = async (name, description, price, durationDays) => {
  const [result] = await pool.query(
    `INSERT INTO membership_plans
        (
            name,
            description,
            price,
            duration_days
        )
        VALUES (?, ?, ?, ?)`,
    [name.trim(), description || null, price, durationDays],
  );

  const [plans] = await pool.query(
    `SELECT
            id,
            name,
            description,
            price,
            duration_days,
            is_active,
            created_at
         FROM membership_plans
         WHERE id = ?`,
    [result.insertId],
  );

  return plans[0];
};

const getMembershipPlanById = async (id) => {
  const [plans] = await pool.query(
    `SELECT
            id,
            name,
            description,
            price,
            duration_days,
            is_active,
            created_at
         FROM membership_plans
         WHERE id = ?`,
    [id],
  );

  if (plans.length === 0) {
    throw new AppError("Membership plan not found", 404);
  }

  return plans[0];
};

const updateMembershipPlan = async (
    id,
    name,
    description,
    price,
    durationDays
) => {

    const [plans] = await pool.query(
        `SELECT
            id
         FROM membership_plans
         WHERE id = ?`,
        [id]
    );

    if (plans.length === 0) {
        throw new AppError(
            "Membership plan not found",
            404
        );
    }

    await pool.query(
        `UPDATE membership_plans
         SET
            name = ?,
            description = ?,
            price = ?,
            duration_days = ?
         WHERE id = ?`,
        [
            name.trim(),
            description || null,
            price,
            durationDays,
            id
        ]
    );

    const [updatedPlans] = await pool.query(
        `SELECT
            id,
            name,
            description,
            price,
            duration_days,
            is_active,
            created_at
         FROM membership_plans
         WHERE id = ?`,
        [id]
    );

    return updatedPlans[0];
};

const updateMembershipPlanStatus = async (
    id,
    isActive
) => {

    const [plans] = await pool.query(
        `SELECT
            id,
            is_active
         FROM membership_plans
         WHERE id = ?`,
        [id]
    );

    if (plans.length === 0) {
        throw new AppError(
            "Membership plan not found",
            404
        );
    }

    await pool.query(
        `UPDATE membership_plans
         SET is_active = ?
         WHERE id = ?`,
        [
            isActive,
            id
        ]
    );

    const [updatedPlans] =
        await pool.query(
            `SELECT
                id,
                name,
                description,
                price,
                duration_days,
                is_active,
                created_at
             FROM membership_plans
             WHERE id = ?`,
            [id]
        );

    return updatedPlans[0];
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
