// A middleware function that checks if the authenticated user is an admin.

export const adminCheck = async (req, res, next) => {
  try {
    // console.log(`User in adminCheck: ${JSON.stringify(req.user)}`);
    
    if (req.user && req.user.isAdmin) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Admins only.' });
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
