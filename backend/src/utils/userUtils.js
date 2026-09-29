const formatUserData = user => {
  if (!user) return null;
  const { password: _password, ...safe } = user;
  return {
    ...safe,
    avatar: user.avatar || `https://picsum.photos/seed/${encodeURIComponent(user.email)}/200/200.jpg`,
    classId: user.classId || null,
    className: user.className || null,
    profile: user.profile || {
      name: user.name || '', hometown: '', phone: '', hobbies: [], bio: ''
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
module.exports = { formatUserData };
