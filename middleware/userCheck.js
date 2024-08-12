// A middleware function that checks if the authenticated user is not an admin.

export const userCheck = async (req, res, next) => {
  try {
    // console.log(`User in userCheck: ${JSON.stringify(req.user)}`);
    
    if (req.user && (req.user.isAdmin === false)) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Users only.' });
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error', error });
  }
};
