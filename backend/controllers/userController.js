const userService = require("../services/userService");
const {
    successResponse
} = require("../utils/response");


const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);

    return successResponse(
            res,
            200,
            "Profile retrieved successfully",
            user
        );
  } catch (error) {
    next(error)
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);

    return successResponse(
            res,
            200,
            "Profile updated successfully",
            user
        );
  } catch (error) {
    next(error)
  }
};

const changePassword = async (req, res) => {
  try {
    await userService.changePassword(req.user.id, req.body);

    return successResponse(
            res,
            200,
            "Password changed successfully"
        );

    
  } catch (error) {
    next(error)
  }
};

const getAllUsers = async (req,res,next) => {

  try {
    const users = await userService.getAllUsers();

    return successResponse(res,200,"Users retrieved successfully",users)
  }catch (error){
    next(error);
  }
}

const getUserById = async (req,res,next) => {
  try{
    const id = Number(req.params.id);

    const user = await userService.getUserById(id);

    return successResponse(res,200,"User retrieved successfully",user)
  }catch(error){
    next(error)
  }
}

const updateUser = async (req,res,next) => {
  try {
    const id = Number(req.params.id);

    const user = await userService.updateUser(id, req.body)

    return successResponse(res,200,"User updated successfully",user)
  }catch(error){
    next(error)
  }
}

const deleteUser = async (req,res,next) => {
  try {
    const id = Number(req.params.id);
    const currentUserId = Number(req.user.id);

    await userService.deleteUser(id,currentUserId)

    return successResponse(
            res,
            200,
            "User deleted successfully"
        );
  }catch(error) {
    next(error)
  }
}

const getDeletedUsers = async (req, res, next) => {

    try {

        const users =
            await userService.getDeletedUsers();

        return successResponse(
            res,
            200,
            "Deleted users retrieved successfully",
            users
        );

    } catch (error) {

        next(error);

    }
};

const restoreUser = async (req,res,next) => {
  try {
    const id = Number(req.params.id);
    await userService.restoreUser(id)

    return successResponse(
            res,
            200,
            "User restored successfully"
        );
  }catch(error) {
    next(error)
  }
}

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUser, deleteUser,restoreUser,getDeletedUsers};
