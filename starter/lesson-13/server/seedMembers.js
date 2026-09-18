import { members } from '../src/data/members.js'

export const seedMemberRecords = members.map((member, index) => ({
  name: member.name,
  role: member.role,
  cohort: member.cohort,
  location: member.location,
  bio: member.bio,
  skills: member.skills,
  interests: member.interests,
  avatar: member.avatar,
  email: `member${String(index + 1).padStart(2, '0')}@example.invalid`,
  status: 'approved',
  ownerId: null,
}))
