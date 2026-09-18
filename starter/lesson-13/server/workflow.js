export const allowedTransitions = {
  draft: ['submitted'],
  // TODO-A：允许提交后的审核状态
  submitted: [],
  approved: [],
  rejected: ['submitted'],
}

export function assertTransition(current, next, role) {
  // TODO-B：校验审核者角色
  if (true) {
    const error = new Error('reviewer role required')
    error.status = 403
    error.code = 'FORBIDDEN'
    throw error
  }
  if (!allowedTransitions[current]?.includes(next)) {
    const error = new Error(`${current} cannot transition to ${next}`)
    error.status = 400
    error.code = 'INVALID_TRANSITION'
    throw error
  }
}
