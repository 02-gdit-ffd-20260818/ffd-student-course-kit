const filterUsersBySearchType = (users, type, terms) => users.filter(user => {
  const profile = user.profile || {};
  const values = {
    name: [profile.name || user.name || ''],
    hometown: [profile.hometown || ''],
    hobby: profile.hobbies || user.hobbies || []
  };
  const candidates = type === 'all' || !values[type] ? Object.values(values).flat() : values[type];
  return candidates.some(value => terms.some(term => String(value).toLowerCase().includes(term)));
});

const getSynonymsForSearch = (groups, query) => {
  const group = groups.find(item => (item.synonyms || []).some(word => {
    const normalized = word.toLowerCase();
    return normalized.includes(query) || query.includes(normalized);
  }));
  return group ? group.synonyms.map(word => word.toLowerCase()).filter(word => word !== query) : [];
};

module.exports = { filterUsersBySearchType, getSynonymsForSearch };
